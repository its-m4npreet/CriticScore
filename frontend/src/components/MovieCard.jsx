import StarRating from "./StarRating";

export default function MovieCard({ movie }) {
  return (
    <div className="bg-[#232323] rounded-xl shadow-2xl overflow-hidden hover:border-[#f5c518] border-2 border-transparent transition-all duration-200">
      <img
        src={movie.image}
        alt={movie.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h4 className="text-lg font-extrabold mb-1 text-[#f5c518] drop-shadow">
          {movie.name}
        </h4>
        <p className="text-gray-300 text-sm mb-2 line-clamp-2">{movie.desc}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-bold bg-[#f5c518] text-black px-2 py-0.5 rounded shadow">
            {movie.year}
          </span>
          <StarRating rating={movie.rating} />
        </div>
      </div>
    </div>
  );
}
