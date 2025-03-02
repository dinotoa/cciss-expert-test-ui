"use client"
import { cn } from "@/lib/utils"
import { UserButton } from "@clerk/nextjs"
import { ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./button"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "./navigation-menu"

const navLinks = [
  {
    label: "Chat",
    href: "/",
    external: false
  },
  {
    label: "CCISS",
    href: "https://www.cciss.it",
    external: true,
    icon: <ExternalLink className="h-4 pl-1" />
  },
]
const NavigationBar: React.FC<React.HTMLProps<HTMLElement>> = ({
  id = "navigation-bar", className
}) => {
  const pathname = usePathname()
  return (
    <header id={id} className={cn("w-full h-fit px-2 flex items-center justify-between", className)}>
      <NavigationMenu>
        <NavigationMenuList>
          {navLinks.map(link => (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild active={pathname === link.href}>
                {link.external
                  ? <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}{link.icon}
                  </a>
                  : <Link href={link.href}>
                    {link.label}{link.icon}
                  </Link>
                }
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="p-0 m-0 flex items-center gap-2">
        <Button type="button" variant="outline"><RefreshCw />
          <a href="/">Nuova chat</a>
        </Button>
        <UserButton />
      </div>
    </header >
  )
}

export default NavigationBar