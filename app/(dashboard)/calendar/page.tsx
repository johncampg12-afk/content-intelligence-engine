'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Clock,
  Hash,
  Music,
  Loader2,
  Sparkles,
  TrendingUp,
  Copy
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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'tutorial',
    scheduled_for: '',
    duration: 15,
    hashtags: '',
    sound: 'Original'
  })
  const [submitting, setSubmitting] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadEvents()
    loadPredictions()
  }, [currentDate])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
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
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content_type: formData.content_type,
          scheduled_for: formData.scheduled_for,
          duration: formData.duration,
          hashtags: formData.hashtags.split(',').map(h => h.trim()),
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
          scheduled_for: '',
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

  const addFromPrediction = (prediction: Prediction) => {
    // Convertir el día óptimo a una fecha
    const days: Record<string, number> = {
      'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 0
    }
    
    const targetDate = new Date(selectedDate || formData.scheduled_for || new Date())
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
      scheduled_for: targetDate.toISOString(),
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
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      setEvents(events.map(e => e.id === id ? { ...e, status } : e))
    } catch (error) {
      console.error('Error updating status:', error)
    }
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

  const getEventsForDate = (date: Date) => {
    if (!date) return []
    const dateStr = date.toDateString()
    return events.filter(e => new Date(e.scheduled_for).toDateString() === dateStr)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const days = getDaysInMonth(currentDate)

  const goPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const openModalForDate = (date: Date) => {
    setSelectedDate(date.toISOString())
    setFormData({
      ...formData,
      scheduled_for: date.toISOString()
    })
    setSelectedEvent(null)
    setShowModal(true)
  }

  const getContentTypeStyle = (type: string) => {
    return contentTypes.find(c => c.value === type)?.color || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
          <button
            onClick={() => {
              setSelectedEvent(null)
              setFormData({
                title: '',
                description: '',
                content_type: 'tutorial',
                scheduled_for: new Date().toISOString(),
                duration: 15,
                hashtags: '',
                sound: 'Original'
              })
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva publicación
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <button onClick={goPrevMonth} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={goNextMonth} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map(day => (
              <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
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
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setShowModal(true); }}
                            className={`text-xs p-1.5 rounded cursor-pointer ${getContentTypeStyle(event.content_type)}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{event.title.substring(0, 30)}</span>
                              {event.status === 'published' && <Check className="w-3 h-3" />}
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-75 mt-0.5">
                              <Clock className="w-2 h-2" />
                              <span>{new Date(event.scheduled_for).getHours()}:00</span>
                              {event.predictions?.viral_score && (
                                <span className="ml-1">🔥 {event.predictions.viral_score}</span>
                              )}
                            </div>
                          </div>
                        ))}
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
        </div>

        {/* Modal de publicación */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
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
                  <div className="mb-4 space-y-2 max-h-60 overflow-y-auto">
                    <p className="text-sm font-medium text-gray-700 mb-2">Tus predicciones guardadas:</p>
                    {predictions.map(pred => (
                      <div
                        key={pred.id}
                        onClick={() => addFromPrediction(pred)}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{pred.video_idea}</p>
                          <span className="text-xs text-blue-600">Score: {pred.viral_score}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{pred.optimal_day} {pred.optimal_hour}:00</span>
                          <span>{formatNumber(pred.predicted_views)} vistas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <form onSubmit={addEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                    <input
                      type="text"
                      value={selectedEvent ? selectedEvent.title : formData.title}
                      onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, title: e.target.value}) : setFormData({...formData, title: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Tutorial de Instagram"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={selectedEvent ? selectedEvent.description : formData.description}
                      onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, description: e.target.value}) : setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detalles del contenido..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={selectedEvent ? selectedEvent.content_type : formData.content_type}
                        onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, content_type: e.target.value}) : setFormData({...formData, content_type: e.target.value})}
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
                        value={selectedEvent ? selectedEvent.scheduled_for.slice(0, 16) : formData.scheduled_for.slice(0, 16)}
                        onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, scheduled_for: e.target.value}) : setFormData({...formData, scheduled_for: e.target.value})}
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
                        value={selectedEvent ? selectedEvent.duration : formData.duration}
                        onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, duration: parseInt(e.target.value)}) : setFormData({...formData, duration: parseInt(e.target.value)})}
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
                          value={selectedEvent ? selectedEvent.sound : formData.sound}
                          onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, sound: e.target.value}) : setFormData({...formData, sound: e.target.value})}
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
                        value={selectedEvent ? selectedEvent.hashtags?.join(', ') : formData.hashtags}
                        onChange={(e) => selectedEvent ? setSelectedEvent({...selectedEvent, hashtags: e.target.value.split(',').map(h => h.trim())}) : setFormData({...formData, hashtags: e.target.value})}
                        placeholder="tutorial, instagram, tips"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {selectedEvent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        value={selectedEvent.status}
                        onChange={(e) => updateStatus(selectedEvent.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="planned">Planificado</option>
                        <option value="published">Publicado</option>
                        <option value="rescheduled">Reprogramado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        selectedEvent ? 'Actualizar' : 'Guardar'
                      )}
                    </button>
                    {selectedEvent && (
                      <button
                        type="button"
                        onClick={() => deleteEvent(selectedEvent.id)}
                        className="py-2 px-4 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}