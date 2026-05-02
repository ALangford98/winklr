import React from 'react';
import { NavbarLinks, navbarLinksOptions } from './NavbarLinks';
import SearchBar from './functional-components/Searchbar';
import DropdownMenu from './functional-components/DropdownMenu';

export const linkOptions = navbarLinksOptions;

export const functionalOptions = [
  { value: 'Search',   label: 'Search Bar',   component: <SearchBar /> },
  { value: 'Dropdown', label: 'Dropdown Menu', component: <DropdownMenu /> },
];

export function renderWidget(widget) {
  if (!widget) return null;
  if (widget.type === 'link') return <NavbarLinks selectedOption={widget.content} />;
  if (widget.type === 'function') {
    return functionalOptions.find((o) => o.value === widget.content)?.component ?? null;
  }
  return null;
}
