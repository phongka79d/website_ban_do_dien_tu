import MobileNav from "@/components/MobileNav";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col pb-16 md:pb-0 overflow-x-clip max-w-full">
      {children}
      <MobileNav />
    </div>
  );
}
