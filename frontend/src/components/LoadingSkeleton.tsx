export default function LoadingSkeleton() {
  return (
    <div className="mb-6 sm:mb-8 animate-pulse">
      <div className="grid grid-cols-1 gap-3">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="h-16 sm:h-20 bg-gradient-to-r from-light-border via-light-accent/20 to-light-border dark:from-dark-border dark:via-dark-accent/20 dark:to-dark-border rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          ></div>
        ))}
      </div>
      <div className="mt-4 text-center text-light-text-secondary dark:text-dark-text-secondary text-sm animate-pulse">
        Loading puzzle...
      </div>
    </div>
  )
}
