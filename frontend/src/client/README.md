# Storefront Catalog Filters

The `/shop` and `/search?q=` routes share the catalog listing and filter state. Filter values are parsed from the URL by `utils/filters.js`; changing a filter resets pagination and mobile edits are committed only by the sheet footer.

Prices in catalog data and URLs are integer minor units. Currency, locale, and `currencyDisplay` come from store Settings, never from visitor location. `utils/money.js` uses `Intl.NumberFormat`, so decimal precision, grouping, symbol placement, and currency-code fallback follow the active locale. Multi-currency conversion is out of scope.

The filter sheet is a lazy chunk and is prefetched when the Filter control receives focus or hover. The catalog service is API-shaped so the mock can be replaced without changing route components. Product cards remain compatible with the existing storefront major-unit display contract.