import { Dispatch, ForwardRefExoticComponent, RefAttributes, SetStateAction, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, LucideProps, X } from "lucide-react";

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  toggleMobileMenu: () => void;
  menuItems: MenuItemProps[];
}

export interface MenuItemProps {
  href: string;
  name: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>,
  children?: SimpleMenuItemProps[];
  isSubMenuOpen?: boolean;
  setIsSubMenuOpen?: Dispatch<SetStateAction<boolean>>;
}

export type SimpleMenuItemProps = {
  path: string;
  name: string;
};

export default function MobileMenu({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  menuItems,
  toggleMobileMenu,
}: MobileMenuProps) {
  const path = usePathname();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  return (
    <div
      className={`fixed top-0 left-0  min-h-screen w-100 bg-primary  transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
        isMobileMenuOpen ? "translate-x-0 shadow-lg " : "-translate-x-full"
      } lg:hidden z-50`}
    >
      <div className="flex flex-row items-end">
        <button
          onClick={toggleMobileMenu}
          className="absolute top-4 right-6 text-white hover:text-primary cursor-pointer active:scale-95 "
        >
          <X color="black" className="w-10 h-10" />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center h-full">
        <ul className="flex flex-col h-full items-center justify-center gap-4 p-4">
          {/* Render menu items dynamically */}
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="flex items-center p-1 text-lg gap-x-2 text-white hover:font-bold"
            >
                <Link
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  href={item.href ?? "/"}
                  className={cn(
                    "flex items-center text-sm uppercase text-white cursor-pointer active:scale-95 ",
                    item.href == path &&
                      "text-secondary lg:text-secondary font-bold text-md"
                  )}
                >
                  {item.name}
                </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
