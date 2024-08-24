export default function UsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-4 p-24">
      {children}
    </main>
  );
}
