import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const OPEN_HOUR = 10;
const CLOSE_HOUR = 23;

// Государственные праздники РФ (месяц 0-индекс, день)
const RF_HOLIDAYS: [number, number][] = [
  [0, 1],[0, 2],[0, 3],[0, 4],[0, 5],[0, 6],[0, 7],[0, 8], // 1-8 января
  [1, 23], // 23 февраля
  [2, 8],  // 8 марта
  [4, 1],[4, 9], // 1 и 9 мая
  [5, 12], // 12 июня
  [10, 4], // 4 ноября
];

function isHoliday(date: Date): boolean {
  return RF_HOLIDAYS.some(([m, d]) => date.getMonth() === m && date.getDate() === d);
}

const SESSIONS_TIMES = ["11:00", "12:00", "14:00", "16:00", "19:00", "20:00"];

const FILMS = [
  {
    id: 1,
    title: "Фиксики против Кработов",
    year: 2019,
    genre: "Анимация, музыка",
    country: "Россия",
    duration: "80 мин",
    age: "6+",
    ageColor: "#FF2D55",
    poster: "https://cdn.poehali.dev/projects/e8548a1c-8166-4d6d-9a2e-9b149b1317f8/bucket/2870f96f-4526-4971-9688-375b6ad86558.jpg",
    description: "Весёлые маленькие человечки Фиксики снова в деле! На этот раз им противостоят коварные Кработы — роботы-крабы, мечтающие захватить мир технологий. Приключения, смех и важные открытия ждут вас!",
    accent: "#FF2D55",
    sessions: [{ label: "Завтра, 31 мая в 12:00" }],
  },
  {
    id: 2,
    title: "Смешарики. Начало",
    year: 2011,
    genre: "Анимация, комедия",
    country: "Россия",
    duration: "86 мин",
    age: "0+",
    ageColor: "#00C853",
    poster: "https://cdn.poehali.dev/projects/e8548a1c-8166-4d6d-9a2e-9b149b1317f8/bucket/d2fc4766-6b40-4e66-829b-a1ddc39fd939.jpeg",
    description: "Как всё начиналось! Крош, Ёжик, Нюша и другие любимые Смешарики впервые появляются на экране. Добрая история о дружбе, приключениях и том, как важно быть собой.",
    accent: "#00B4FF",
    sessions: [{ label: "Сегодня, 30 мая в 18:00" }],
  },
  {
    id: 3,
    title: "Тачки",
    year: 2006,
    genre: "Анимация, приключения",
    country: "США",
    duration: "112 мин",
    age: "0+",
    ageColor: "#00C853",
    poster: "https://cdn.poehali.dev/projects/e8548a1c-8166-4d6d-9a2e-9b149b1317f8/bucket/72918c09-bf03-4648-8949-f683cc5f8c6f.jpg",
    description: "Неукротимый в своём желании побеждать гоночный автомобиль «Молния» Маккуин застревает в маленьком городке Радиатор-Спрингс. Здесь он встречает Салли, Дока Хадсона и Метра — и понимает, что в жизни есть вещи важнее гонок.",
    accent: "#FFD600",
    sessions: [{ label: "10 июня в 11:00" }],
  },
  {
    id: 4,
    title: "Смешарики снимают кино",
    year: 2023,
    genre: "Анимация, комедия",
    country: "Россия",
    duration: "90 мин",
    age: "6+",
    ageColor: "#FF2D55",
    poster: "https://cdn.poehali.dev/projects/e8548a1c-8166-4d6d-9a2e-9b149b1317f8/bucket/d2fc4766-6b40-4e66-829b-a1ddc39fd939.jpeg",
    description: "Смешарики снимают кино! И не просто кино, а целый сборник из нескольких короткометражных фильмов. В программе боевик и комедия, фантастика и фэнтези, мюзикл и немое кино. А также эльфы, феи, древние пророчества, мировое зло, Пин Бонд и роботы-дроиды.",
    accent: "#9C27B0",
    sessions: [{ label: "15 июня в 12:00" }],
  },
];

const DAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

// ---- Модалка покупки билета ----
interface TicketModalProps {
  film: typeof FILMS[0];
  onClose: () => void;
}

function TicketModal({ film, onClose }: TicketModalProps) {
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !name || !phone) return;
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-6 md:p-8 animate-scale-in"
        style={{ background: "#1a1a2e", border: `1px solid ${film.accent}50` }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
        >
          <Icon name="X" size={18} />
        </button>

        {submitted ? (
          <div className="text-center py-8 flex flex-col items-center gap-4">
            <div className="text-6xl">🎉</div>
            <h3 className="font-pacifico text-2xl" style={{ color: "#FFD600" }}>Билет забронирован!</h3>
            <p className="font-nunito text-base" style={{ color: "rgba(255,255,255,0.7)" }}>
              <b className="text-white">{name}</b>, ждём вас на сеанс<br />
              <span style={{ color: film.accent }}>{film.title}</span><br />
              в <b className="text-white">{selectedTime}</b>
            </p>
            <p className="font-nunito text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Тамбов, Мичуринская ул., д. 203, подъезд 3, этаж 5, кв. 100
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-8 py-3 rounded-2xl font-nunito font-bold text-base"
              style={{ background: `linear-gradient(135deg, ${film.accent}, #FF6B00)`, color: "white" }}
            >
              Отлично!
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <img src={film.poster} alt={film.title} className="w-14 h-20 object-cover rounded-xl shrink-0" />
              <div>
                <div className="font-nunito font-bold text-lg text-white leading-tight">{film.title}</div>
                <div className="font-nunito text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {film.year} · {film.country} · {film.duration}
                </div>
                <span className="age-badge text-white mt-1 inline-block" style={{ background: film.ageColor }}>{film.age}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <div className="font-nunito font-bold text-sm mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Выберите время сеанса
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {SESSIONS_TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className="py-2 rounded-xl font-nunito font-bold text-base transition-all hover:scale-105"
                      style={selectedTime === t
                        ? { background: film.accent, color: "white", boxShadow: `0 4px 16px ${film.accent}60` }
                        : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-nunito font-bold text-sm mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Ваше имя</div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Иван"
                  required
                  className="w-full px-4 py-3 rounded-xl font-nunito text-base text-white outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                />
              </div>

              <div>
                <div className="font-nunito font-bold text-sm mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Телефон</div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  required
                  className="w-full px-4 py-3 rounded-xl font-nunito text-base text-white outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!selectedTime || !name || !phone}
                className="w-full py-4 rounded-2xl font-nunito font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: `linear-gradient(135deg, ${film.accent}, #FF6B00)`,
                  color: "white",
                  boxShadow: selectedTime && name && phone ? `0 8px 24px ${film.accent}50` : "none",
                }}
              >
                🎟 Купить билет
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ---- LiveClock ----
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const holiday = isHoliday(now);
  const isOpen = !holiday && h >= OPEN_HOUR && h < CLOSE_HOUR;
  const day = DAYS[now.getDay()];
  const date = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()} г.`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="font-pacifico text-5xl md:text-6xl tracking-wider"
        style={{ color: "#FFD600", textShadow: "0 0 30px rgba(255,214,0,0.6)" }}
      >
        {h}:{m}:{s}
      </div>
      <div className="font-nunito text-white/70 text-sm capitalize">
        {day}, {date}
      </div>
      <div
        className="px-6 py-2 rounded-full font-nunito font-bold text-sm uppercase tracking-widest"
        style={isOpen
          ? { background: "linear-gradient(135deg,#FF8C00,#FF6B00)", color: "white", boxShadow: "0 0 20px rgba(255,140,0,0.5)" }
          : { background: "#2a2a2a", color: "#888" }
        }
      >
        {holiday ? "🎉 Праздник — выходной" : isOpen ? "🎬 Открыто" : "🌙 Закрыто"}
      </div>
      <div className="font-nunito text-white/40 text-xs">
        {holiday ? "В праздничные дни не работаем" : "Работаем: Пн–Вс, 10:00–23:00"}
      </div>
    </div>
  );
}

function FloatingDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="float-1 absolute top-20 left-10 text-4xl opacity-20">🎬</div>
      <div className="float-2 absolute top-40 right-16 text-3xl opacity-15">⭐</div>
      <div className="float-3 absolute top-60 left-1/4 text-2xl opacity-10">🍿</div>
      <div className="float-1 absolute bottom-40 right-10 text-3xl opacity-15">🎭</div>
      <div className="float-2 absolute bottom-60 left-20 text-2xl opacity-10">✨</div>
    </div>
  );
}

function NavBar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(13,13,26,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "2px solid rgba(255,214,0,0.2)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div
          className="font-pacifico text-xl md:text-2xl cursor-pointer"
          style={{ color: "#FFD600" }}
          onClick={() => setActive("home")}
        >
          🎪 Кинотеатр Вани
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { id: "home", label: "Главная" },
            { id: "films", label: "Фильмы" },
            { id: "schedule", label: "Расписание" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="nav-link font-nunito font-bold text-base transition-colors"
              style={{ color: active === item.id ? "#FFD600" : "rgba(255,255,255,0.8)" }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex md:hidden gap-5">
          {[
            { id: "home", icon: "Home" },
            { id: "films", icon: "Film" },
            { id: "schedule", icon: "Calendar" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{ color: active === item.id ? "#FFD600" : "rgba(255,255,255,0.5)" }}
            >
              <Icon name={item.icon} size={22} />
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Hero({ setActive }: { setActive: (s: string) => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden stars-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #FFD600 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #FF2D55 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #00B4FF 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
        <div className="text-6xl">🎬</div>
        <h1 className="font-pacifico text-5xl md:text-7xl shimmer-text leading-tight">Кинотеатр Вани</h1>
        <p className="font-nunito text-xl md:text-2xl max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
          Уже открыт сегодня для вас! 🌟<br />Смотрите любимые мультфильмы у нас!
        </p>

        <div className="rounded-3xl p-8 border"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,214,0,0.25)", backdropFilter: "blur(12px)" }}>
          <LiveClock />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <button
            onClick={() => setActive("films")}
            className="font-nunito font-bold text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #FFD600, #FF6B00)", color: "#0D0D1A", boxShadow: "0 8px 30px rgba(255,214,0,0.4)" }}
          >
            🎥 Смотреть фильмы
          </button>
          <button
            onClick={() => setActive("schedule")}
            className="font-nunito font-bold text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "2px solid rgba(255,255,255,0.25)" }}
          >
            📅 Расписание
          </button>
        </div>
      </div>

      <div className="ticker-wrap absolute bottom-0 left-0 w-full py-3"
        style={{ background: "rgba(255,214,0,0.08)", borderTop: "1px solid rgba(255,214,0,0.15)" }}>
        <div className="ticker-content font-nunito font-bold text-sm" style={{ color: "#FFD600" }}>
          🎬 Фиксики против Кработов — 31 мая в 12:00 &nbsp;|&nbsp; 🎭 Смешарики. Начало — 30 мая в 18:00 &nbsp;|&nbsp; 🚗 Тачки — 10 июня в 11:00 &nbsp;|&nbsp; 🎥 Смешарики снимают кино — 15 июня в 12:00 &nbsp;|&nbsp; ⭐ Работаем Пн–Вс 10:00–23:00, кроме праздников &nbsp;|&nbsp; 📍 Тамбов, Мичуринская ул., д. 203 &nbsp;&nbsp;&nbsp;
        </div>
      </div>
    </section>
  );
}

function FilmCard({ film, onBuy }: { film: typeof FILMS[0]; onBuy: (f: typeof FILMS[0]) => void }) {
  return (
    <div
      className="card-glow rounded-3xl overflow-hidden flex flex-col"
      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${film.accent}40` }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>
        <img src={film.poster} alt={film.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(13,13,26,0.9) 0%, transparent 55%)" }} />
        <div className="absolute top-3 right-3">
          <span className="age-badge text-white" style={{ background: film.ageColor }}>{film.age}</span>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold font-nunito"
            style={{ background: `${film.accent}30`, color: film.accent, border: `1px solid ${film.accent}50` }}>
            {film.year} · {film.country}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-nunito font-bold text-xl text-white leading-tight">{film.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-lg font-nunito" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>
            🎭 {film.genre}
          </span>
          <span className="px-2 py-1 rounded-lg font-nunito" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>
            ⏱ {film.duration}
          </span>
        </div>
        <p className="font-nunito text-sm leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.6)" }}>
          {film.description}
        </p>
        <div className="rounded-2xl p-3 flex items-center gap-2"
          style={{ background: `${film.accent}12`, border: `1px solid ${film.accent}30` }}>
          <Icon name="Clock" size={14} style={{ color: film.accent }} />
          <span className="font-nunito font-bold text-sm" style={{ color: film.accent }}>
            {film.sessions[0].label}
          </span>
        </div>
        <button
          onClick={() => onBuy(film)}
          className="w-full py-3 rounded-2xl font-nunito font-bold text-base transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${film.accent}, #FF6B00)`,
            color: "white",
            boxShadow: `0 6px 20px ${film.accent}40`,
          }}
        >
          🎟 Купить билет
        </button>
      </div>
    </div>
  );
}

function FilmsSection({ onBuy }: { onBuy: (f: typeof FILMS[0]) => void }) {
  return (
    <section className="px-4 py-16" style={{ background: "var(--cinema-dark)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title text-4xl md:text-5xl mb-3" style={{ color: "#FFD600" }}>🎥 Наши фильмы</h2>
          <p className="font-nunito text-lg" style={{ color: "rgba(255,255,255,0.55)" }}>
            Четыре отличных мультфильма для всей семьи
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FILMS.map((film) => (
            <FilmCard key={film.id} film={film} onBuy={onBuy} />
          ))}
        </div>
      </div>
    </section>
  );
}

const SCHEDULE = [
  { film: FILMS[1], when: "Сегодня — 30 мая 2026", time: "18:00", sub: "сегодня", color: "#00B4FF" },
  { film: FILMS[0], when: "Завтра — 31 мая 2026", time: "12:00", sub: "завтра", color: "#FF2D55" },
  { film: FILMS[2], when: "10 июня 2026", time: "11:00", sub: "10 июня", color: "#FFD600" },
  { film: FILMS[3], when: "15 июня 2026", time: "12:00", sub: "15 июня", color: "#9C27B0" },
];

function ScheduleSection({ onBuy }: { onBuy: (f: typeof FILMS[0]) => void }) {
  return (
    <section className="px-4 py-16" style={{ background: "var(--cinema-dark2)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title text-4xl md:text-5xl mb-3" style={{ color: "#FFD600" }}>📅 Расписание сеансов</h2>
          <p className="font-nunito text-lg" style={{ color: "rgba(255,255,255,0.55)" }}>Приходите с семьёй — мы вас ждём!</p>
        </div>

        <div className="flex flex-col gap-5">
          {SCHEDULE.map((s, i) => (
            <div key={i} className="rounded-3xl overflow-hidden flex flex-col sm:flex-row"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${s.color}35` }}>
              <div className="flex items-center justify-center p-6 sm:w-44 shrink-0" style={{ background: `${s.color}18` }}>
                <div className="text-center">
                  <div className="font-pacifico text-4xl" style={{ color: s.color }}>{s.time}</div>
                  <div className="font-nunito text-xs font-bold uppercase tracking-widest mt-1" style={{ color: `${s.color}90` }}>{s.sub}</div>
                </div>
              </div>
              <div className="flex items-center gap-5 p-5 flex-1">
                <img src={s.film.poster} alt={s.film.title} className="w-14 h-20 object-cover rounded-xl shrink-0" />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="font-nunito font-bold text-lg text-white leading-tight">{s.film.title}</div>
                  <div className="font-nunito text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{s.when}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="age-badge text-white" style={{ background: s.film.ageColor }}>{s.film.age}</span>
                    <span className="font-nunito text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>{s.film.duration}</span>
                    <span className="font-nunito text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)" }}>{s.film.country}</span>
                  </div>
                </div>
                <button
                  onClick={() => onBuy(s.film)}
                  className="shrink-0 px-4 py-2 rounded-xl font-nunito font-bold text-sm transition-all hover:scale-105"
                  style={{ background: s.color, color: "white", boxShadow: `0 4px 14px ${s.color}50` }}
                >
                  🎟 Билет
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl p-8 text-center"
          style={{ background: "rgba(255,214,0,0.04)", border: "1px solid rgba(255,214,0,0.18)" }}>
          <div className="text-4xl mb-3">📍</div>
          <h3 className="font-pacifico text-2xl mb-2" style={{ color: "#FFD600" }}>Как нас найти</h3>
          <p className="font-nunito text-base mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>
            Тамбов, Мичуринская ул., д. 203, подъезд 3, этаж 5, кв. 100
          </p>
          <p className="font-nunito text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
            Работаем каждый день: 10:00 – 23:00 (кроме государственных праздников)
          </p>
          <a
            href="https://yandex.ru/maps/?text=Тамбов+Мичуринская+улица+203"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-nunito font-bold text-base transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #FF2D55, #FF6B00)", color: "white", boxShadow: "0 8px 24px rgba(255,45,85,0.3)" }}
          >
            <Icon name="MapPin" size={18} />
            Открыть в Яндекс.Картах
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 px-4 text-center"
      style={{ background: "rgba(0,0,0,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="font-pacifico text-2xl mb-2" style={{ color: "#FFD600" }}>🎪 Кинотеатр Вани</div>
      <p className="font-nunito text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
        Тамбов · Мичуринская ул., д. 203 · Пн–Вс 10:00–23:00 · Кроме праздников
      </p>
    </footer>
  );
}

export default function Index() {
  const [active, setActive] = useState("home");
  const [ticketFilm, setTicketFilm] = useState<typeof FILMS[0] | null>(null);

  const handleNav = (id: string) => {
    setActive(id);
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: "var(--cinema-dark)" }}>
      <FloatingDecor />
      <NavBar active={active} setActive={handleNav} />
      <div id="home"><Hero setActive={handleNav} /></div>
      <div id="films"><FilmsSection onBuy={setTicketFilm} /></div>
      <div id="schedule"><ScheduleSection onBuy={setTicketFilm} /></div>
      <Footer />
      {ticketFilm && <TicketModal film={ticketFilm} onClose={() => setTicketFilm(null)} />}
    </div>
  );
}
