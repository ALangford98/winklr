import React, { useContext } from 'react';
import { AppContext } from '../appContext';

export default function NavbarBrand() {
  const { state } = useContext(AppContext);
  const logoSrc = state.brand?.logo ?? `${process.env.PUBLIC_URL}/branding/wordmark-tag.svg`;
  return (
    <div className="navbar-brand">
      <img src={logoSrc} alt="Brand" className="navbar-brand-logo" />
    </div>
  );
}
