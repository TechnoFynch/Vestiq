import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  ChevronDownIcon,
  HeartIcon,
  LogOutIcon,
  SearchIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { removeToken } from "@/features/slices/authSlice";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import appRoutes from "@/constants/appRoutes";

function CartBadge({ count }: { count: number }) {
  const [animClass, setAnimClass] = useState("");
  const prevCount = useRef(0);

  useEffect(() => {
    if (count === 0) {
      setAnimClass("");
      prevCount.current = 0;
      return;
    }
    const cls = prevCount.current === 0 ? "badge-pop" : "badge-bump";
    setAnimClass(cls);
    prevCount.current = count;
    const t = setTimeout(() => setAnimClass(""), 400);
    return () => clearTimeout(t);
  }, [count]);

  if (count === 0) return null;

  return (
    <span
      className={`absolute -top-1.5 -right-2 flex items-center justify-center
                  min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[11px]
                  font-semibold rounded-full ring-2 ring-white shadow-md
                  leading-none select-none ${animClass} ${count > 0 ? "" : "hidden!"}`}
    >
      {count > 10 ? "10+" : count}
    </span>
  );
}

// User ID: a39c9db4-ad41-479b-8bb2-3d545ad4db1d

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { isLoading, data: cartData } = useCart();

  // const cartData = { count: 0 };

  const dispatch = useAppDispatch();
  const { name } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Derive initials from name for avatar fallback
  const initials = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const logout = () => {
    dispatch(removeToken());
    toast.success("Logged Out successfully!");
    navigate("/login");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setMobileSearchOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#262626]/80 backdrop-blur-sm shadow-sm">
      {/* Main bar */}
      <div className="flex items-center justify-between px-4 md:px-8 min-h-16 gap-4">
        {/* Logo */}
        <h1 className="font-bold text-2xl text-gray-300 shrink-0">
          Shop<span className="text-indigo-400">Core</span>
        </h1>

        {/* Search — desktop only inline */}
        <div className="hidden md:block flex-1 max-w-lg">
          <Popover open={searchQuery.length >= 3}>
            <PopoverTrigger asChild>
              <InputGroup className="rounded-sm w-full">
                <InputGroupAddon align="inline-start">
                  <SearchIcon className="text-slate-800" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <InputGroupAddon align="inline-end">
                    <XCircleIcon
                      className="cursor-pointer text-slate-800"
                      onClick={clearSearch}
                    />
                  </InputGroupAddon>
                )}
              </InputGroup>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] rounded-sm hidden md:block"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              Search results go here.
            </PopoverContent>
          </Popover>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          {/* Mobile: search toggle */}

          <Popover open={searchQuery.length >= 3}>
            <PopoverTrigger asChild>
              <button
                className="md:hidden relative inline-flex items-center justify-center w-10 h-10 text-white"
                aria-label="Toggle search"
                onClick={() => setMobileSearchOpen((v) => !v)}
              >
                {mobileSearchOpen ? (
                  <XCircleIcon className="w-5 h-5" />
                ) : (
                  <SearchIcon className="w-5 h-5" />
                )}
              </button>
            </PopoverTrigger>
          </Popover>

          {/* Cart */}
          <Link
            className="relative inline-flex items-center justify-center w-10 h-10"
            aria-label={`Cart, ${cartData?.count ?? 0} items`}
            to="/cart"
          >
            <ShoppingCartIcon className="w-7 h-7 text-white" />
            <CartBadge count={cartData?.count ?? 0} />
          </Link>

          {/* User dropdown */}
          {name ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-white/10 hover:text-inherit cursor-pointer px-2 focus:outline-none! focus-visible:ring-0! focus-visible:ring-offset-0! active:bg-transparent! data-[state=open]:bg-transparent!"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {/* Name only on desktop */}
                    <span className="hidden md:block text-white text-sm">
                      {name}
                    </span>
                    <ChevronDownIcon className="text-white w-4 h-4 hidden md:block" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-sm" align="end">
                <Link to="/wishlist">
                  <DropdownMenuItem className="rounded-sm cursor-pointer">
                    <HeartIcon className="w-4 h-4" />
                    Wishlist
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="rounded-sm cursor-pointer"
                  onClick={logout}
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="rounded-sm" asChild>
              <Link to={appRoutes.user.login}>Login</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile search bar — slides in below the main bar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3">
          <Popover open={searchQuery.length >= 3}>
            <PopoverTrigger asChild>
              <InputGroup className="rounded-sm w-full">
                <InputGroupAddon align="inline-start">
                  <SearchIcon className="text-slate-800" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search products…"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <InputGroupAddon align="inline-end">
                    <XCircleIcon
                      className="cursor-pointer text-slate-800"
                      onClick={clearSearch}
                    />
                  </InputGroupAddon>
                )}
              </InputGroup>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] rounded-sm"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              Search results go here.
            </PopoverContent>
          </Popover>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
