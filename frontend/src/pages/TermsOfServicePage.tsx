import { useEffect, useState } from 'react'

export default function TermsOfServicePage() {
  const [content, setContent] = useState('')

  useEffect(() => {
    fetch('/TERMS_OF_SERVICE.md')
      .then(res => res.text())
      .then(text => setContent(text))
  }, [])

  const renderContent = () => {
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // H1
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            {line.substring(2)}
          </h1>
        )
      }
      // H2
      else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl sm:text-2xl font-bold mt-8 mb-4 text-light-text-primary dark:text-dark-text-primary">
            {line.substring(3)}
          </h2>
        )
      }
      // H3
      else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-lg sm:text-xl font-semibold mt-6 mb-3 text-light-text-primary dark:text-dark-text-primary">
            {line.substring(4)}
          </h3>
        )
      }
      // Bold standalone line
      else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <p key={i} className="font-bold text-light-text-secondary dark:text-dark-text-secondary mb-2">
            {line.substring(2, line.length - 2)}
          </p>
        )
      }
      // List items
      else if (line.startsWith('- ')) {
        const text = line.substring(2)
        const parts = text.split(/(\*\*.*?\*\*)/)
        elements.push(
          <li key={i} className="ml-6 mb-2 text-light-text-secondary dark:text-dark-text-secondary list-disc">
            {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx}>{part.substring(2, part.length - 2)}</strong>
              }
              return part
            })}
          </li>
        )
      }
      // Numbered list
      else if (/^\d+\./.test(line)) {
        const text = line.replace(/^\d+\.\s/, '')
        const parts = text.split(/(\*\*.*?\*\*)/)
        elements.push(
          <li key={i} className="ml-6 mb-2 text-light-text-secondary dark:text-dark-text-secondary list-decimal">
            {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx}>{part.substring(2, part.length - 2)}</strong>
              }
              return part
            })}
          </li>
        )
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2"></div>)
      }
      // Regular paragraph
      else {
        const parts = line.split(/(\*\*.*?\*\*)/)
        elements.push(
          <p key={i} className="mb-3 text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
            {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx}>{part.substring(2, part.length - 2)}</strong>
              }
              return part
            })}
          </p>
        )
      }
    }
    
    return elements
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-light-surface/30 dark:bg-dark-surface/20 rounded-2xl p-6 sm:p-8 md:p-12">
        {content ? renderContent() : (
          <div className="text-center text-light-text-secondary dark:text-dark-text-secondary">
            Loading...
          </div>
        )}
      </div>
    </div>
  )
}
