import React from "react";
import CatalogProducts from "../components/CatalogProducts";

const CatalogPage = ({ onNavigate, onProductClick, category }) => {
  return (
    <main className="flex-1">
      <CatalogProducts
        onNavigate={onNavigate} // ĐẢM BẢO truyền đúng onNavigate
        onProductClick={onProductClick}
        category={category}
      />
    </main>
  );
};

export default CatalogPage;

