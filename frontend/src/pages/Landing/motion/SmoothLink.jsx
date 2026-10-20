import React, { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useScrollApi } from "./LenisProvider";

export function SmoothLink({ href, className = "", children, onClick, ...rest }) {
  const { scrollTo } = useScrollApi();
  const navigate = useNavigate();

  const handleHashJump = useCallback(
    (event) => {
      event.preventDefault();
      onClick?.();
      requestAnimationFrame(() => {
        if (!document.querySelector(href)) return;
        scrollTo(href);
        window.history.replaceState(null, "", href);
      });
    },
    [href, onClick, scrollTo]
  );

  if (href.startsWith("#")) {
    return (
      <a href={href} onClick={handleHashJump} className={className} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link
      to={href}
      onClick={onClick}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** The doubled-label hover roll used by the nav and utility bar. */
export function RollLink({
  label,
  href,
  className = "",
  onClick,
}) {
  return (
    <SmoothLink href={href} onClick={onClick} className={`roll ${className}`}>
      <span>{label}</span>
      <span aria-hidden>{label}</span>
    </SmoothLink>
  );
}
