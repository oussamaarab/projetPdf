import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card } from '../../components/UI';
import ToolCard from '../../components/ToolCard/ToolCard';
import toolService, { getToolById } from '../../services/toolService';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const data = await toolService.getFavorites();
      const favoriteTools = data.map(fav => getToolById(fav.tool_id)).filter(Boolean);
      setFavorites(favoriteTools);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFavorites();
  }, [fetchFavorites]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Favorite Tools</h1>
        <p className="text-slate-400">Quick access to your most-used conversion tools</p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <FaStar className="text-4xl text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">No favorite tools yet</p>
            <Link
              to="/all-tools"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Browse Tools
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Favorites;
