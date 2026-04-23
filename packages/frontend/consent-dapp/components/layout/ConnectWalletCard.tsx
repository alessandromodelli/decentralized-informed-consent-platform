import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ConnectWalletButton from "./ConnectWalletButton";

export default function ConnectWalletCard() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Connetti il tuo Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Per accedere alla dashboard e gestire i tuoi consensi, connetti il
            tuo wallet.
          </p>
          <ConnectWalletButton />
        </CardContent>
      </Card>
    </div>
  );
}
