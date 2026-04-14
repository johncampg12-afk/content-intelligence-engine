'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  Clock,
  Hash,
  Music,
  Loader2,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  List,
  Filter,
  Download,
  BarChart3,
  Bell
} from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  description: string
  content_type: string
  scheduled_for: string
  duration: number
  hashtags: string[]
  sound: string
  status: string
  prediction_id: string | null
  predictions?: {
    viral_score: number
    predicted_views: number
  }
}

interface Prediction {
  id: string
  video_idea: string
  content_type: string
  viral_score: number
  predicted_views: number
  optimal_day: string
  optimal_hour: number
}

const contentTypes = [
  { value: 'tutorial', label: 'Tutorial', color: 'bg-blue-100 text-blue-700' },
  { value: 'entertainment', label: 'Entretenimiento', color: 'bg-purple-100 text-purple-700' },
  { value: 'educational', label: 'Educativo', color: 'bg-green-100 text-green-700' },
  { value: 'inspirational', label: 'Inspiracional', color: 'bg-amber-100 text-amber-700' },
  { value: 'challenge', label: 'Challenge', color: 'bg-pink-100 text-pink-700' },
  { value: 'review', label: 'Review', color: 'bg-indigo-100 text-indigo-700' }
]

const statuses = [
  { value: 'planned', label: 'Planificado', color: 'bg-gray-100 text-gray-600' },
  { value: 'published', label: 'Publicado', color: 'bg-green-100 text-green-700' },
  { value: 'rescheduled', label: 'Reprogramado', color: 'bg-amber-100 text-amber-700' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-700' }
]

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Función para obtener fecha local en formato YYYY-MM-DDThh:mm
const getLocalDateTimeString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Función para crear fecha UTC a partir de fecha local
const createUTCDate = (year: number, month: number, day: number, hour: number = 0, minute: number = 0): Date => {
  return new Date(Date.UTC(year, month, day, hour, minute))
}

// Función para obtener la fecha en UTC a partir de un string local
const getUTCDateFromLocal = (localDateTime: string): Date => {
  const [datePart, timePart] = localDateTime.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  return createUTCDate(year, month - 1, day, hour, minute)
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<'month' | 'week' | 'agenda'>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showNotifications, setShowNotifications] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'tutorial',
    scheduled_for: getLocalDateTimeString(new Date()),
    duration: 15,
    hashtags: '',
    sound: 'Original'
  })
  const [submitting, setSubmitting] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadEvents()
    loadPredictions()
  }, [currentDate, viewType])

  const loadEvents = async () => {
    try {
      setLoading(true)
      let startDate: Date
      let endDate: Date
      
      if (viewType === 'month') {
        startDate = createUTCDate(currentDate.getFullYear(), currentDate.getMonth(), 1)
        endDate = createUTCDate(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59)
      } else {
        const dayOfWeek = currentDate.getDay()
        const diff = currentDate.getDate() - dayOfWeek
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), diff)
        startDate = createUTCDate(start.getFullYear(), start.getMonth(), start.getDate())
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        endDate = createUTCDate(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59)
      }
      
      const response = await fetch(`/api/calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
      const data = await response.json()
      
      if (data.events) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPredictions = async () => {
    try {
      const response = await fetch('/api/predict/history')
      const data = await response.json()
      if (data.predictions) {
        setPredictions(data.predictions.slice(0, 10))
      }
    } catch (error) {
      console.error('Error loading predictions:', error)
    }
  }

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Convertir fecha local a UTC para almacenar
      const utcDate = getUTCDateFromLocal(formData.scheduled_for)
      
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          scheduled_for: utcDate.toISOString(),
          duration: formData.duration,
          hashtags: formData.hashtags.split(',').map(h => h.trim()).filter(h => h),
          sound: formData.sound
        })
      })
      
      const data = await response.json()
      
      if (data.event) {
        setEvents([...events, data.event])
        setShowModal(false)
        setFormData({
          title: '',
          description: '',
          content_type: 'tutorial',
          scheduled_for: getLocalDateTimeString(new Date()),
          duration: 15,
          hashtags: '',
          sound: 'Original'
        })
      }
    } catch (error) {
      console.error('Error adding event:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const updateEvent = async () => {
    if (!selectedEvent) return
    setSubmitting(true)
    
    try {
      const utcDate = getUTCDateFromLocal(selectedEvent.scheduled_for)
      
      const response = await fetch('/api/calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEvent.id,
          scheduled_for: utcDate.toISOString(),
          status: selectedEvent.status
        })
      })
      
      const data = await response.json()
      
      if (data.event) {
        setEvents(events.map(e => e.id === selectedEvent.id ? data.event : e))
        setShowModal(false)
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('Error updating event:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const addFromPrediction = (prediction: Prediction) => {
    const days: Record<string, number> = {
      'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 0
    }
    
    const targetDate = new Date()
    const currentDay = targetDate.getDay()
    const targetDay = days[prediction.optimal_day]
    let diff = targetDay - currentDay
    if (diff <= 0) diff += 7
    
    targetDate.setDate(targetDate.getDate() + diff)
    targetDate.setHours(prediction.optimal_hour, 0, 0)
    
    setFormData({
      title: prediction.video_idea.substring(0, 100),
      description: prediction.video_idea,
      content_type: prediction.content_type || 'tutorial',
      scheduled_for: getLocalDateTimeString(targetDate),
      duration: 15,
      hashtags: '',
      sound: 'Original'
    })
    
    setShowPredictions(false)
    setShowModal(true)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('¿Eliminar esta publicación del calendario?')) return
    
    try {
      await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' })
      setEvents(events.filter(e => e.id !== id))
      setShowModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const exportToCSV = () => {
    const filteredEvents = getFilteredEvents()
    const headers = ['Título', 'Tipo', 'Fecha', 'Hora', 'Duración', 'Hashtags', 'Sonido', 'Estado', 'Viral Score']
    const rows = filteredEvents.map(event => {
      const eventDate = new Date(event.scheduled_for)
      return [
        event.title,
        contentTypes.find(c => c.value === event.content_type)?.label || event.content_type,
        eventDate.toLocaleDateString('es-ES'),
        `${eventDate.getUTCHours()}:00`,
        `${event.duration}s`,
        event.hashtags?.join(', ') || '',
        event.sound,
        statuses.find(s => s.value === event.status)?.label || event.status,
        event.predictions?.viral_score || '-'
      ]
    })
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calendar_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getFilteredEvents = () => {
    let filtered = events
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.content_type === filterType)
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus)
    }
    return filtered
  }

  const getCalendarStats = () => {
    const filtered = getFilteredEvents()
    const totalPlanned = filtered.filter(e => e.status === 'planned').length
    const totalPublished = filtered.filter(e => e.status === 'published').length
    const avgViralScore = filtered.filter(e => e.predictions?.viral_score).reduce((sum, e) => sum + (e.predictions?.viral_score || 0), 0) / (filtered.filter(e => e.predictions?.viral_score).length || 1)
    
    return { totalPlanned, totalPublished, avgViralScore: avgViralScore.toFixed(0) }
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    const next7Days = new Date()
    next7Days.setDate(now.getDate() + 7)
    
    const filtered = events.filter(e => {
      const eventDate = new Date(e.scheduled_for)
      return eventDate >= now && eventDate <= next7Days && e.status !== 'published'
    })
    
    return filtered.sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getContentTypeStyle = (type: string) => {
    return contentTypes.find(c => c.value === type)?.color || 'bg-gray-100 text-gray-700'
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startOffset = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startOffset; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getWeekDays = () => {
    const dayOfWeek = currentDate.getDay()
    const diff = currentDate.getDate() - dayOfWeek
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), diff)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getEventsForDate = (date: Date) => {
    if (!date) return []
    const filtered = getFilteredEvents()
    return filtered.filter(e => {
      const eventDate = new Date(e.scheduled_for)
      return eventDate.getUTCDate() === date.getDate() &&
             eventDate.getUTCMonth() === date.getMonth() &&
             eventDate.getUTCFullYear() === date.getFullYear()
    })
  }

  const goPrev = () => {
    if (viewType === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 7)
      setCurrentDate(newDate)
    }
  }

  const goNext = () => {
    if (viewType === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 7)
      setCurrentDate(newDate)
    }
  }

  const openModalForDate = (date: Date) => {
    setSelectedEvent(null)
    setFormData({
      title: '',
      description: '',
      content_type: 'tutorial',
      scheduled_for: getLocalDateTimeString(date),
      duration: 15,
      hashtags: '',
      sound: 'Original'
    })
    setShowModal(true)
  }

  const stats = getCalendarStats()
  const upcomingEvents = getUpcomingEvents()

  // Renderizar vista mensual
  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate)
    
    return (
      <>
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((date, idx) => {
            const dayEvents = date ? getEventsForDate(date) : []
            const isToday = date && date.toDateString() === new Date().toDateString()
            
            return (
              <div
                key={idx}
                onClick={() => date && openModalForDate(date)}
                className={`min-h-[120px] border-r border-b border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !date ? 'bg-gray-50' : ''
                }`}
              >
                {date && (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-medium ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-xs text-gray-400">{dayEvents.length}</span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => {
                        const eventDate = new Date(event.scheduled_for)
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setShowModal(true); }}
                            className={`text-xs p-1.5 rounded cursor-pointer ${getContentTypeStyle(event.content_type)}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{event.title.substring(0, 25)}</span>
                              {event.status === 'published' && <Check className="w-3 h-3" />}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-xs opacity-75">
                              <Clock className="w-2 h-2" />
                              <span>{eventDate.getUTCHours()}:00</span>
                              {event.predictions?.viral_score && (
                                <span className="ml-1">🔥{event.predictions.viral_score}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-400 text-center pt-1">
                          +{dayEvents.length - 3} más
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </>
    )
  }

  // Renderizar vista semanal
  const renderWeekView = () => {
    const weekDaysList = getWeekDays()
    
    return (
      <div className="grid grid-cols-7">
        {weekDaysList.map((date, idx) => {
          const dayEvents = getEventsForDate(date)
          const isToday = date.toDateString() === new Date().toDateString()
          
          return (
            <div
              key={idx}
              onClick={() => openModalForDate(date)}
              className={`min-h-[400px] border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${idx === 6 ? 'border-r-0' : ''}`}
            >
              <div className={`sticky top-0 bg-white pb-2 mb-2 border-b ${isToday ? 'border-blue-500' : 'border-gray-100'}`}>
                <div className="text-center">
                  <div className="text-xs text-gray-500">{weekDays[idx]}</div>
                  <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {dayEvents.map(event => {
                  const eventDate = new Date(event.scheduled_for)
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setShowModal(true); }}
                      className={`p-2 rounded-lg cursor-pointer ${getContentTypeStyle(event.content_type)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate">{event.title.substring(0, 20)}</span>
                        {event.status === 'published' && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
                        <Clock className="w-3 h-3" />
                        <span>{eventDate.getUTCHours()}:00</span>
                        <span>{event.duration}s</span>
                      </div>
                      {event.predictions?.viral_score && (
                        <div className="mt-1 text-xs font-medium">
                          🔥 Score: {event.predictions.viral_score}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Renderizar vista agenda
  const renderAgendaView = () => {
    const filteredEvents = getFilteredEvents()
    const groupedByDate: { [date: string]: CalendarEvent[] } = {}
    
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.scheduled_for)
      const dateKey = `${eventDate.getUTCFullYear()}-${eventDate.getUTCMonth()}-${eventDate.getUTCDate()}`
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = []
      }
      groupedByDate[dateKey].push(event)
    })
    
    const sortedDates = Object.keys(groupedByDate).sort()
    
    return (
      <div className="divide-y divide-gray-100 p-4">
        {sortedDates.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            No hay publicaciones programadas
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const firstEvent = groupedByDate[dateKey][0]
            const date = new Date(firstEvent.scheduled_for)
            
            return (
              <div key={dateKey} className="py-4 first:pt-0">
                <div className="sticky top-0 bg-white pb-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                </div>
                <div className="space-y-2 mt-2">
                  {groupedByDate[dateKey].map(event => {
                    const eventDate = new Date(event.scheduled_for)
                    return (
                      <div
                        key={event.id}
                        onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-16 text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {eventDate.getUTCHours()}:00
                          </div>
                        </div>
                        <div className={`w-1 h-10 rounded-full ${getContentTypeStyle(event.content_type).split(' ')[0]}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{event.title}</span>
                            {event.status === 'published' && <Check className="w-3 h-3 text-green-500" />}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                            <span>{contentTypes.find(c => c.value === event.content_type)?.label}</span>
                            <span>{event.duration}s</span>
                            {event.predictions?.viral_score && (
                              <span className="text-blue-600">Score: {event.predictions.viral_score}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
            </div>
            <p className="text-gray-500 ml-11">
              Planifica y organiza tu estrategia de contenido
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewType('month')}
                className={`px-3 py-1.5 text-sm rounded-l-lg transition-colors ${viewType === 'month' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <LayoutGrid className="w-4 h-4 inline mr-1" />
                Mes
              </button>
              <button
                onClick={() => setViewType('week')}
                className={`px-3 py-1.5 text-sm transition-colors ${viewType === 'week' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4 inline mr-1" />
                Semana
              </button>
              <button
                onClick={() => setViewType('agenda')}
                className={`px-3 py-1.5 text-sm rounded-r-lg transition-colors ${viewType === 'agenda' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Agenda
              </button>
            </div>
            
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            
            <button
              onClick={() => openModalForDate(new Date())}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva publicación
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Planificados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlanned}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Publicados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPublished}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Viral Score Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgViralScore}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        {upcomingEvents.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Próximas publicaciones</span>
              </div>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-xs text-amber-600 hover:text-amber-800"
              >
                {showNotifications ? 'Ocultar' : `Ver ${upcomingEvents.length}`}
              </button>
            </div>
            
            {showNotifications && (
              <div className="mt-3 space-y-2">
                {upcomingEvents.slice(0, 5).map(event => {
                  const eventDate = new Date(event.scheduled_for)
                  return (
                    <div key={event.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>
                          {eventDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-gray-700 line-clamp-1 max-w-[200px]">{event.title}</span>
                      </div>
                      <button
                        onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Filtrar:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los tipos</option>
            {contentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={goPrev} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {viewType === 'month' 
              ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : `Semana del ${getWeekDays()[0].getDate()} de ${monthNames[getWeekDays()[0].getMonth()]}`
            }
          </h2>
          <button onClick={goNext} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {viewType === 'month' && renderMonthView()}
          {viewType === 'week' && renderWeekView()}
          {viewType === 'agenda' && renderAgendaView()}
        </div>

        {/* Modal de publicación */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent ? 'Editar publicación' : 'Nueva publicación'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                {!selectedEvent && (
                  <button
                    onClick={() => setShowPredictions(!showPredictions)}
                    className="w-full mb-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {showPredictions ? 'Ocultar predicciones guardadas' : 'Cargar desde predicción guardada'}
                  </button>
                )}
                
                {showPredictions && !selectedEvent && predictions.length > 0 && (
                  <div className="mb-4 space-y-2 max-h-60 overflow-y-auto border border-gray-100 rounded-lg p-2">
                    <p className="text-sm font-medium text-gray-700 mb-2 px-2">Tus predicciones guardadas:</p>
                    {predictions.map(pred => (
                      <div
                        key={pred.id}
                        onClick={() => addFromPrediction(pred)}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{pred.video_idea}</p>
                          <span className="text-xs text-blue-600 font-medium">Score: {pred.viral_score}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{pred.optimal_day} {pred.optimal_hour}:00</span>
                          <span>{formatNumber(pred.predicted_views)} vistas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedEvent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedEvent.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
                      <input
                        type="datetime-local"
                        value={getLocalDateTimeString(new Date(selectedEvent.scheduled_for))}
                        onChange={(e) => {
                          const utcDate = getUTCDateFromLocal(e.target.value)
                          setSelectedEvent({...selectedEvent, scheduled_for: utcDate.toISOString()})
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        value={selectedEvent.status}
                        onChange={(e) => setSelectedEvent({...selectedEvent, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statuses.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={updateEvent}
                        disabled={submitting}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Actualizar'}
                      </button>
                      <button
                        onClick={() => deleteEvent(selectedEvent.id)}
                        className="py-2 px-4 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={addEvent} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Tutorial de Instagram"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Detalles del contenido..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                          value={formData.content_type}
                          onChange={(e) => setFormData({...formData, content_type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {contentTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
                        <input
                          type="datetime-local"
                          value={formData.scheduled_for}
                          onChange={(e) => setFormData({...formData, scheduled_for: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duración (segundos)</label>
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                          min={5}
                          max={60}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sonido</label>
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={formData.sound}
                            onChange={(e) => setFormData({...formData, sound: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.hashtags}
                          onChange={(e) => setFormData({...formData, hashtags: e.target.value})}
                          placeholder="tutorial, instagram, tips"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Guardar publicación'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}