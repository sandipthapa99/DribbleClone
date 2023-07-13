import { NavLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import AuthProviders from "./AuthProviders";
import { getCurrentUser } from "@/lib/session";

const Navbar = async () => {
    const session = await getCurrentUser();
    console.log("🚀 ~ file: Navbar.tsx:10 ~ Navbar ~ session:", session);
    return (
        <nav className="flexBetween navbar">
            <div className="flex-1 flexStart gap-10">
                <Link href="/">
                    <Image src={"/logo.svg"} height={43} width={115} alt="logo" />
                </Link>

                <ul className="xl:flex hidden text-small gap-7">
                    {NavLinks.map((link) => (
                        <Link href={link.href} key={link.key}>
                            {link.text}
                        </Link>
                    ))}
                </ul>
            </div>
            <div className="flexCenter gap-4">
                {session?.user ? (
                    <>
                        {session?.user?.image && (
                            <Link href={`/profile/${session?.user?.id}`}>
                                <Image src={session?.user?.image} alt={session.user.name} height={40} width={40} className="rounded-full" />
                            </Link>
                        )}
                        <Link href={"/create-project"}>Share Work</Link>
                    </>
                ) : (
                    <AuthProviders />
                )}
            </div>
        </nav>
    );
};

export default Navbar;
