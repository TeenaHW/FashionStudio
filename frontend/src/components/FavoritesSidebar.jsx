import React, { useEffect, useState } from "react";
import { X, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";

const FavoritesSidebar = ({ isOpen, onClose }) => {
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const loadFavorites = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(Array.isArray(favs) ? favs : []);
    } catch {
      setFavorites([]);
    }
  };

  useEffect(() => {
    if (isOpen) loadFavorites();
  }, [isOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const results = [];
        for (const id of favorites) {
          try {
            const res = await api.get(`/products/${id}`);
            results.push(res.data);
          } catch {}
        }
        setProducts(results);
      } catch {
        setProducts([]);
      }
    };
    if (favorites.length) fetchProducts(); else setProducts([]);
  }, [favorites]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-600" />
            <h2 className="text-xl font-semibold">Favorites</h2>
            <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">{favorites.length}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          {favorites.length === 0 ? (
            <div className="text-center text-gray-600">No favorites yet.</div>
          ) : (
            <div className="grid gap-4">
              {products.map((p) => (
                <button
                  key={p._id}
                  onClick={() => { navigate(`/products/${p._id}`); onClose(); }}
                  className="flex items-center gap-3 text-left p-3 border rounded-lg hover:shadow"
                >
                  <img src={p.imageUrl || p.image} alt={p.name} className="w-14 h-14 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-600">Rs. {p.price?.toLocaleString()}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesSidebar;


