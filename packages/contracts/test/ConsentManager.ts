import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";
import { network } from "hardhat";
import { keccak256, toBytes, toHex } from "viem";

// ─── helpers ────────────────────────────────────────────────────────────────

const CID_1 = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
const CID_2 = "bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354";

// Simula keccak256(toUtf8Bytes(cid)) — stesso calcolo del frontend
function docHash(viem: Awaited<ReturnType<typeof hre.network.connect>>["viem"], cid: string) {
  return keccak256(toBytes(cid)) as `0x${string}`;
}

const ZERO_HASH = `0x${"0".repeat(64)}` as `0x${string}`;

// ─── suite principale ────────────────────────────────────────────────────────

describe("ConsentManager", async () => {

  const { viem } = await network.create();
  const wallets   = await viem.getWalletClients();

  // account dedicati — ogni ruolo ha il suo wallet
  const patient  = wallets[0].account.address;
  const patient2 = wallets[1].account.address;
  const stranger = wallets[2].account.address;

  // deploy fresco — stato condiviso tra i describe annidati
  // (i test sono scritti in sequenza consapevole dello stato)
  const cm = await viem.deployContract("ConsentManager");

  const HASH_1 = docHash(viem, CID_1);
  const HASH_2 = docHash(viem, CID_2);

  // ── 1. costanti ─────────────────────────────────────────────────────────────

  await describe("costanti", async () => {

    await it("MAX_CONSENTS_PER_PATIENT è 100", async () => {
      const cap = await cm.read.MAX_CONSENTS_PER_PATIENT();
      assert.equal(cap, 100);
    });

  });

  // ── 2. giveConsent ───────────────────────────────────────────────────────────

  await describe("giveConsent", async () => {

    await it("primo consenso: isValid=true, version=1, timestamp>0", async () => {
      await cm.write.giveConsent([HASH_1, CID_1], { account: patient });
      const [isValid, timestamp, version] =
        await cm.read.isConsentValid([patient, HASH_1]);
      assert.equal(isValid, true);
      assert.equal(version, 1);
      assert.ok(timestamp > 0n, "timestamp deve essere > 0");
    });

    await it("aggiunge hash alla lista del paziente", async () => {
      const hashes = await cm.read.getPatientConsents([patient]);
      assert.equal(hashes.length, 1);
      assert.equal(hashes[0].toLowerCase(), HASH_1.toLowerCase());
    });

    await it("getPatientConsentCount ritorna 1 dopo il primo consenso", async () => {
      const count = await cm.read.getPatientConsentCount([patient]);
      assert.equal(count, 1n);
    });

    await it("secondo documento diverso: aggiunge secondo hash all'array", async () => {
      await cm.write.giveConsent([HASH_2, CID_2], { account: patient });
      const count = await cm.read.getPatientConsentCount([patient]);
      assert.equal(count, 2n);
    });

    await it("revert InvalidDocumentHash su hash zero", async () => {
      await assert.rejects(
        cm.write.giveConsent([ZERO_HASH, CID_1], { account: patient }),
        /InvalidDocumentHash/
      );
    });

    await it("revert EmptyCid su stringa vuota", async () => {
      const freshHash = keccak256(toBytes("fresh"));
      await assert.rejects(
        cm.write.giveConsent([freshHash, ""], { account: patient }),
        /EmptyCid/
      );
    });

    await it("revert ConsentAlreadyActive su consenso già attivo", async () => {
      // HASH_1 è già attivo dal test precedente
      await assert.rejects(
        cm.write.giveConsent([HASH_1, CID_1], { account: patient }),
        /ConsentAlreadyActive/
      );
    });

    await it("pazienti diversi possono dare consenso sullo stesso hash", async () => {
      await cm.write.giveConsent([HASH_1, CID_1], { account: patient2 });
      const [isValid,, version] =
        await cm.read.isConsentValid([patient2, HASH_1]);
      assert.equal(isValid, true);
      assert.equal(version, 1);
    });

    await it("stranger non ha ancora consensi", async () => {
      const [isValid, timestamp, version] =
        await cm.read.isConsentValid([stranger, HASH_1]);
      assert.equal(isValid, false);
      assert.equal(timestamp, 0n);
      assert.equal(version, 0);
    });

  });

  // ── 3. revokeConsent ────────────────────────────────────────────────────────

  await describe("revokeConsent", async () => {

    await it("revoca: isValid diventa false", async () => {
      await cm.write.revokeConsent([HASH_1], { account: patient });
      const [isValid,,] = await cm.read.isConsentValid([patient, HASH_1]);
      assert.equal(isValid, false);
    });

    await it("dopo revoca timestamp e version restano invariati", async () => {
      const [, timestamp, version] =
        await cm.read.isConsentValid([patient, HASH_1]);
      // timestamp e version sono stati settati al giveConsent, non azzerati
      assert.ok(timestamp > 0n);
      assert.equal(version, 1);
    });

    await it("revoca non rimuove l'hash dall'array del paziente", async () => {
      // l'array tiene traccia storica — la revoca non lo modifica
      const hashes = await cm.read.getPatientConsents([patient]);
      assert.ok(
        hashes.some(h => h.toLowerCase() === HASH_1.toLowerCase()),
        "HASH_1 deve restare nell'array anche dopo revoca"
      );
    });

    await it("revert ConsentNotFound su hash mai registrato", async () => {
      const unknownHash = keccak256(toBytes("unknown-doc"));
      await assert.rejects(
        cm.write.revokeConsent([unknownHash], { account: patient }),
        /ConsentNotFound/
      );
    });

    await it("revert ConsentAlreadyRevoked su consenso già revocato", async () => {
      // HASH_1 è già stato revocato sopra
      await assert.rejects(
        cm.write.revokeConsent([HASH_1], { account: patient }),
        /ConsentAlreadyRevoked/
      );
    });

    await it("un paziente non può revocare il consenso di un altro", async () => {
      // HASH_1 è attivo per patient2 — stranger prova a revocarlo
      await assert.rejects(
        cm.write.revokeConsent([HASH_1], { account: stranger }),
        /ConsentNotFound/  // stranger non ha mai registrato HASH_1
      );
      // patient2 non è stato toccato
      const [isValid,,] = await cm.read.isConsentValid([patient2, HASH_1]);
      assert.equal(isValid, true);
    });

  });

  // ── 4. re-consenso dopo revoca ───────────────────────────────────────────────

  await describe("re-consenso dopo revoca", async () => {

    await it("re-consenso: isValid=true, version incrementata a 2", async () => {
      // HASH_1 di patient è stato revocato — ora può ri-consentire
      await cm.write.giveConsent([HASH_1, CID_1], { account: patient });
      const [isValid,, version] =
        await cm.read.isConsentValid([patient, HASH_1]);
      assert.equal(isValid, true);
      assert.equal(version, 2);
    });

    await it("re-consenso NON duplica HASH_1 nell'array", async () => {
      const hashes = await cm.read.getPatientConsents([patient]);
      const occorrenze = hashes.filter(
        h => h.toLowerCase() === HASH_1.toLowerCase()
      ).length;
      assert.equal(occorrenze, 1, "HASH_1 deve apparire una sola volta nell'array");
    });

    await it("getPatientConsentCount rimane invariato dopo re-consenso", async () => {
      // patient ha HASH_1 e HASH_2 → count = 2, non 3
      const count = await cm.read.getPatientConsentCount([patient]);
      assert.equal(count, 2n);
    });

    await it("revoca e re-consenso multipli incrementano version correttamente", async () => {
      // version attuale: 2
      await cm.write.revokeConsent([HASH_1], { account: patient });
      await cm.write.giveConsent([HASH_1, CID_1], { account: patient });
      const [,, version] = await cm.read.isConsentValid([patient, HASH_1]);
      assert.equal(version, 3);
    });

  });

  // ── 5. isConsentValid ────────────────────────────────────────────────────────

  await describe("isConsentValid", async () => {

    await it("address/hash mai registrato ritorna (false, 0, 0)", async () => {
      const neverHash = keccak256(toBytes("never-registered"));
      const [isValid, timestamp, version] =
        await cm.read.isConsentValid([stranger, neverHash]);
      assert.equal(isValid, false);
      assert.equal(timestamp, 0n);
      assert.equal(version, 0);
    });

    await it("non espone il CID (solo 3 valori ritornati)", async () => {
      // isConsentValid ritorna (bool, uint256, uint8) — nessun CID
      // verifichiamo che la tupla abbia esattamente 3 elementi
      const result = await cm.read.isConsentValid([patient, HASH_1]);
      assert.equal(result.length, 3, "deve ritornare esattamente 3 valori, nessun CID");
    });

    await it("è una view: leggibile da chiunque senza wallet", async () => {
      // usa publicClient (nessun account necessario)
      const publicClient = await viem.getPublicClient();
      const result = await publicClient.readContract({
        address: cm.address,
        abi: cm.abi,
        functionName: "isConsentValid",
        args: [patient, HASH_1],
      });
      assert.equal(result[0], true); // isValid
    });

  });

  // ── 6. getPatientConsents e getPatientConsentCount ───────────────────────────

  await describe("getPatientConsents / getPatientConsentCount", async () => {

    await it("array vuoto per paziente senza consensi", async () => {
      const hashes = await cm.read.getPatientConsents([stranger]);
      assert.equal(hashes.length, 0);
    });

    await it("count è 0 per paziente senza consensi", async () => {
      const count = await cm.read.getPatientConsentCount([stranger]);
      assert.equal(count, 0n);
    });

    await it("array contiene tutti gli hash registrati in ordine", async () => {
      const hashes = await cm.read.getPatientConsents([patient]);
      // patient ha registrato HASH_1 prima di HASH_2
      assert.equal(hashes[0].toLowerCase(), HASH_1.toLowerCase());
      assert.equal(hashes[1].toLowerCase(), HASH_2.toLowerCase());
    });

    await it("count corrisponde alla lunghezza dell'array", async () => {
      const hashes = await cm.read.getPatientConsents([patient]);
      const count  = await cm.read.getPatientConsentCount([patient]);
      assert.equal(count, BigInt(hashes.length));
    });

    await it("isolamento completo: i consensi di patient non compaiono per patient2", async () => {
      const hashesP2 = await cm.read.getPatientConsents([patient2]);
      // patient2 ha solo HASH_1
      assert.equal(hashesP2.length, 1);
      assert.equal(hashesP2[0].toLowerCase(), HASH_1.toLowerCase());
      // HASH_2 appartiene solo a patient
      const hasHash2 = hashesP2.some(
        h => h.toLowerCase() === HASH_2.toLowerCase()
      );
      assert.equal(hasHash2, false);
    });

  });

  // ── 7. cap TooManyConsents ───────────────────────────────────────────────────

  await describe("TooManyConsents cap", async () => {

    await it("revert al 101° documento distinto", async () => {
      // wallet[3] è fresco — nessun consenso pregresso
      const freshWallet = wallets[3];
      const freshAddr   = freshWallet.account.address;
      const cap         = await cm.read.MAX_CONSENTS_PER_PATIENT();

      // registra esattamente 100 hash distinti
      for (let i = 0; i < cap; i++) {
        const h = keccak256(toBytes(`cap-doc-${i}`));
        await cm.write.giveConsent([h, CID_1], { account: freshAddr });
      }

      // verifica che count sia esattamente 100
      const count = await cm.read.getPatientConsentCount([freshAddr]);
      assert.equal(count, BigInt(cap));

      // il 101° deve revertire
      const extra = keccak256(toBytes("cap-doc-extra"));
      await assert.rejects(
        cm.write.giveConsent([extra, CID_1], { account: freshAddr }),
        /TooManyConsents/
      );
    });

    await it("re-consenso su hash già registrato NON conta verso il cap", async () => {
      // wallet[3] ha già 100 hash — revocare e ri-consentire su uno esistente deve funzionare
      const freshAddr = wallets[3].account.address;
      const existingHash = keccak256(toBytes("cap-doc-0"));

      await cm.write.revokeConsent([existingHash], { account: freshAddr });
      // re-consenso su hash già nell'array: non aggiunge all'array, non triggera TooManyConsents
      await cm.write.giveConsent([existingHash, CID_1], { account: freshAddr });

      const count = await cm.read.getPatientConsentCount([freshAddr]);
      assert.equal(count, 100n, "count deve restare 100, non 101");
    });

  });

});