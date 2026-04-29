import { GuestMigrationDialog } from "@/components/layout/guest-migration-dialog";
import { MainShell } from "@/components/layout/main-shell";
import { Suspense } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense>
        <MainShell>{children}</MainShell>
      </Suspense>
      <GuestMigrationDialog />
    </>
  );
}
