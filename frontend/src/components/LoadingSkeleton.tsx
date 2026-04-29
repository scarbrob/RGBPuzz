export default function LoadingSkeleton() {
  return (
    <div className="mb-6 sm:mb-8 animate-fade-in">
      <div className="flex justify-center gap-3 sm:gap-4 py-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl animate-pulse"
            style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(167, 139, 250, 0.15))',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <div className="mt-4 text-center text-light-text-secondary dark:text-dark-text-secondary text-sm">
        Loading puzzle...
      </div>
    </div>
  )
}
