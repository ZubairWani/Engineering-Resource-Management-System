import { AppRoutes } from './routes';
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App;