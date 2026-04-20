// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ConsentManager
 * Gestione del consenso informato sanitario on-chain.
 * Nessun dato sensibile on-chain. Il CID IPFS è emesso solo via evento,
 * mai salvato nello storage. La revoca invalida logicamente il consenso
 * ma non cancella l'hash (immutabilità della blockchain).
 */
contract ConsentManager {

    /// Limite per paziente per evitare array unbounded e gas DoS.
    uint8 public constant MAX_CONSENTS_PER_PATIENT = 100;

    struct Consent {
        bytes32 documentHash;
        uint256 timestamp;
        uint8   version;   // max 255 re-consensi sullo stesso documento
        bool    isValid;
    }

    // Storage

    // patient → documentHash → Consent
    mapping(address => mapping(bytes32 => Consent)) private consents;

    // patient → lista hash (per UI e iterazione). Cappata a MAX_CONSENTS_PER_PATIENT.
    mapping(address => bytes32[]) private patientConsentHashes;

    // Traccia se un hash è già nell'array (per evitare duplicati al re-consenso).
    mapping(address => mapping(bytes32 => bool)) private hashRegistered;

    // Events
    event ConsentGiven(
        address indexed patient,
        bytes32 indexed documentHash,
        string          ipfsCid,     // off-chain reference — solo nell'evento 
        uint256         timestamp,
        uint8           version
    );

    event ConsentRevoked(
        address indexed patient,
        bytes32 indexed documentHash,
        uint256         timestamp
    );

    // Custom errors
    error InvalidDocumentHash();
    error ConsentAlreadyActive(bytes32 documentHash);
    error ConsentNotFound(bytes32 documentHash);
    error ConsentAlreadyRevoked(bytes32 documentHash);
    error TooManyConsents();
    error EmptyCid();

    // External functions

    /**
     * Il paziente fornisce il consenso per un documento.
     * @param  documentHash  calcolato off-chain.
     * @param  ipfsCid       CID IPFS del documento. Non salvato nello storage, solo emesso nell'evento.
     */
    function giveConsent(
        bytes32        documentHash,
        string calldata ipfsCid
    ) external {
        if (documentHash == bytes32(0))    revert InvalidDocumentHash();
        if (bytes(ipfsCid).length == 0)    revert EmptyCid();

        Consent storage c = consents[msg.sender][documentHash];

        // Blocca re-consenso su documento già attivo (ammesso solo dopo revoca)
        if (c.timestamp != 0 && c.isValid) revert ConsentAlreadyActive(documentHash);

        // Incrementa version (parte da 0, quindi primo consenso = version 1)
        uint8 newVersion = c.version + 1;

        // Aggiorna lo stato — CID non salvato qui
        c.documentHash = documentHash;
        c.timestamp    = block.timestamp;
        c.version      = newVersion;
        c.isValid      = true;

        // Registra nell'array solo la prima volta (guard contro duplicati)
        if (!hashRegistered[msg.sender][documentHash]) {
            if (patientConsentHashes[msg.sender].length >= MAX_CONSENTS_PER_PATIENT)
                revert TooManyConsents();
            patientConsentHashes[msg.sender].push(documentHash);
            hashRegistered[msg.sender][documentHash] = true;
        }

        // CID emesso solo nell'evento — non permanente nello storage
        emit ConsentGiven(msg.sender, documentHash, ipfsCid, block.timestamp, newVersion);
    }

    /**
     * Il paziente revoca il consenso per un documento specifico.
     * @param  documentHash  Hash del documento da revocare.
     */
    function revokeConsent(bytes32 documentHash) external {
        Consent storage c = consents[msg.sender][documentHash];

        if (c.timestamp == 0) revert ConsentNotFound(documentHash);
        if (!c.isValid)       revert ConsentAlreadyRevoked(documentHash);

        c.isValid = false;

        emit ConsentRevoked(msg.sender, documentHash, block.timestamp);
    }

    /**
     * Verifica pubblica della validità di un consenso.
     * @param  patient       Address del paziente.
     * @param  documentHash  Hash del documento.
     * @return isValid       true se il consenso è attivo e non revocato.
     * @return timestamp     Timestamp dell'ultima operazione giveConsent.
     * @return version       Numero di revisione (1 = primo consenso, 2 = re-consenso, …).
     */
    function isConsentValid(
        address patient,
        bytes32 documentHash
    ) external view returns (
        bool    isValid,
        uint256 timestamp,
        uint8   version
    ) {
        Consent storage c = consents[patient][documentHash];
        return (c.isValid, c.timestamp, c.version);
    }

    /**
     * Restituisce la lista degli hash dei documenti per cui il paziente
     * ha mai dato consenso (inclusi quelli poi revocati).
     * @param  patient  Address del paziente.
     * @return          Array di bytes32 (documentHash).
     */
    function getPatientConsents(
        address patient
    ) external view returns (bytes32[] memory) {
        return patientConsentHashes[patient];
    }

    /**
     * Restituisce il numero di documenti registrati per un paziente.
     * Utile per paginazione lato frontend senza caricare l'array completo.
     */
    function getPatientConsentCount(
        address patient
    ) external view returns (uint256) {
        return patientConsentHashes[patient].length;
    }
}