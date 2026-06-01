"use client";

import React, { useEffect, useRef, useState } from "react";

const AnimatedNavLink = ({ href, active, children, onClick }) => {
  const defaultTextColor = active ? "text-white" : "text-white/70";
  const hoverTextColor = active ? "text-gold" : "text-white";

  return (
    <a
      href={href}
      onClick={onClick}
      className="group relative block h-6 overflow-hidden text-sm font-semibold"
    >
      <div className="flex flex-col transition-transform duration-[400ms] ease-out group-hover:-translate-y-6">
        <span className={`block h-6 leading-6 ${defaultTextColor}`}>{children}</span>
        <span className={`block h-6 leading-6 ${hoverTextColor}`}>{children}</span>
      </div>
    </a>
  );
};

export function Navbar({ pathname = "/", onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full");
  const shapeTimeoutRef = useRef(null);

  const navLinksData = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Nasıl Çalışır", href: "#nasil-calisir" },
    { label: "Ücretlendirme", href: "/pricing" }
  ];

  const toggleMenu = () => {
    setIsOpen((current) => !current);
  };

  const handleLinkClick = (event, href) => {
    if (href.startsWith("/")) {
      event.preventDefault();
      onNavigate?.(href);
      setIsOpen(false);
      return;
    }

    if (href.startsWith("#")) {
      event.preventDefault();
      setIsOpen(false);
      const scrollToTarget = () => {
        const target = document.querySelector(href);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      };

      if (pathname !== "/") {
        onNavigate?.("/");
        window.setTimeout(scrollToTarget, 120);
        return;
      }

      scrollToTarget();
    }
  };

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/")) return pathname === href;
    return false;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass("rounded-xl");
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full");
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <button
      type="button"
      onClick={(event) => handleLinkClick(event, "/")}
      className="flex items-center justify-center"
      aria-label="SkillSync ana sayfa"
    >
      <img
        src="/SkillSync-Logo.png"
        alt="SkillSync"
        className={`w-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition-[height] duration-300 ease-out ${
          isScrolled ? "h-12 sm:h-14" : "h-16 sm:h-20"
        }`}
      />
    </button>
  );

  const signupButtonElement = (
    <div className="relative group w-full sm:w-auto">
      <div
        className="absolute inset-0 -m-2 hidden rounded-full bg-gray-100 opacity-40 blur-lg transition-all duration-300 ease-out pointer-events-none group-hover:-m-3 group-hover:opacity-60 group-hover:blur-xl sm:block"
      />
      <button
        type="button"
        onClick={() => {
          setIsOpen(false);
          onNavigate?.("/cv-analizi");
        }}
        className="relative z-10 w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:from-gray-200 hover:to-gray-400 sm:w-auto sm:px-3 sm:text-sm"
      >
        Ücretsiz dene
      </button>
    </div>
  );

  return (
    <header
      className={`fixed left-1/2 top-6 z-50 flex -translate-x-1/2 flex-col items-center
                  px-6 backdrop-blur-sm
                  ${headerShapeClass}
                  border border-white/18 bg-white/18
                  w-[calc(100%-2rem)] max-w-5xl
                  transition-[border-radius,padding,background-color,box-shadow] duration-300 ease-out
                  ${isScrolled ? "py-2 shadow-[0_14px_44px_rgba(0,0,0,0.18)]" : "py-3"}`}
    >
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-x-6 sm:gap-x-8">
        <nav className="hidden items-center space-x-4 justify-self-start text-sm sm:flex sm:space-x-6">
          {navLinksData.map((link) => (
            <AnimatedNavLink
              key={link.href}
              href={link.href}
              active={isActive(link.href)}
              onClick={(event) => handleLinkClick(event, link.href)}
            >
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="justify-self-start sm:hidden">
          <button
            className="flex h-8 w-8 items-center justify-center text-gray-300 focus:outline-none"
            onClick={toggleMenu}
            type="button"
            aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <div className="justify-self-center">
          {logoElement}
        </div>

        <div className="hidden items-center gap-2 justify-self-end sm:flex sm:gap-3">
          {signupButtonElement}
        </div>
      </div>

      <div
        className={`flex w-full flex-col items-center overflow-hidden transition-all duration-300 ease-in-out sm:hidden
                    ${isOpen ? "max-h-[1000px] pt-4 opacity-100" : "max-h-0 pt-0 opacity-0 pointer-events-none"}`}
      >
        <nav className="flex w-full flex-col items-center space-y-4 text-base">
          {navLinksData.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleLinkClick(event, link.href)}
              className="w-full text-center text-gray-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 flex w-full flex-col items-center space-y-4">
          {signupButtonElement}
        </div>
      </div>
    </header>
  );
}
