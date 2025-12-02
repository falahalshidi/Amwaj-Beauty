import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo-container">
          <img 
            src="/logo.png" 
            alt="Amwaj Beauty" 
            className="logo" 
            onError={(e) => {
              const img = e.target as HTMLImageElement
              if (img.src.includes('logo.png')) {
                img.src = '/logo.jpg'
              } else if (img.src.includes('logo.jpg')) {
                img.src = '/logo.svg'
              }
            }} 
          />
          <h1 className="brand-name">Amwaj Beauty</h1>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">مكياج أنيق وبسيط</h2>
            <p className="hero-subtitle">
              اكتشفي مجموعتنا المميزة من منتجات المكياج العالية الجودة
            </p>
            <button 
              className="cta-button"
              onClick={() => navigate('/products')}
            >
              تسوّقي الآن
            </button>
          </div>
        </section>

        <section className="features-section">
          <div className="feature-card">
            <h3>جودة عالية</h3>
            <p>منتجات مختارة بعناية</p>
          </div>
          <div className="feature-card">
            <h3>أسعار مناسبة</h3>
            <p>أفضل الأسعار في السوق</p>
          </div>
          <div className="feature-card">
            <h3>توصيل سريع</h3>
            <p>نوصل طلبك بسرعة</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 Amwaj Beauty. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  )
}

export default LandingPage

