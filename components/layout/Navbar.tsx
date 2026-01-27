import { getSettings } from "@/lib/db";
import { NavbarUI } from "./NavbarUI";

export async function Navbar() {
    const settings = (await getSettings("store")) as any;
    const menuItems = settings?.menuItems?.length > 0
        ? settings.menuItems
        : [
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "Karungali Mala", href: "/karungali-mala" },
            { label: "About Us", href: "/about" },
            { label: "Just Print", href: "/just-print" },
        ];

    return <NavbarUI menuItems={menuItems} />;
}
