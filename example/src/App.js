import React from 'react'

import { useMyHook } from 'pdf-viewer'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App
