import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../models/event.dart';
import '../services/event_service.dart';
import '../main.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({Key? key}) : super(key: key);

  @override
  _EventsScreenState createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  final EventService _eventService = EventService();
  late final ValueNotifier<List<Event>> _selectedEvents;
  Map<DateTime, List<Event>> _eventsByDay = {};
  
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    _selectedEvents = ValueNotifier(_getEventsForDay(_selectedDay!));
    _loadEvents();
  }

  @override
  void dispose() {
    _selectedEvents.dispose();
    super.dispose();
  }

  void _loadEvents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final events = await _eventService.getUpcomingEvents();
      final Map<DateTime, List<Event>> eventsByDay = {};
      for (var event in events) {
        final day = DateTime.utc(event.startDate.year, event.startDate.month, event.startDate.day);
        if (eventsByDay[day] == null) {
          eventsByDay[day] = [];
        }
        eventsByDay[day]!.add(event);
      }
      setState(() {
        _eventsByDay = eventsByDay;
        _isLoading = false;
        _selectedEvents.value = _getEventsForDay(_selectedDay!);
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  List<Event> _getEventsForDay(DateTime day) {
    return _eventsByDay[DateTime.utc(day.year, day.month, day.day)] ?? [];
  }

  void _onDaySelected(DateTime selectedDay, DateTime focusedDay) {
    if (!isSameDay(_selectedDay, selectedDay)) {
      setState(() {
        _selectedDay = selectedDay;
        _focusedDay = focusedDay;
      });
      _selectedEvents.value = _getEventsForDay(selectedDay);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Événements à venir'),
        backgroundColor: kAppHeaderBlue,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          TableCalendar<Event>(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: _onDaySelected,
            eventLoader: _getEventsForDay,
            calendarStyle: CalendarStyle(
              markerDecoration: BoxDecoration(
                color: Theme.of(context).colorScheme.secondary,
                shape: BoxShape.circle,
              ),
            ),
            headerStyle: const HeaderStyle(
              formatButtonVisible: false,
              titleCentered: true,
            ),
            onPageChanged: (focusedDay) {
              _focusedDay = focusedDay;
            },
          ),
          const SizedBox(height: 8.0),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(child: Text('Erreur: $_error'));
    }
    return ValueListenableBuilder<List<Event>>(
      valueListenable: _selectedEvents,
      builder: (context, value, _) {
        if (value.isEmpty) {
          return const Center(
            child: Text('Aucun événement pour ce jour.'),
          );
        }
        return ListView.builder(
          itemCount: value.length,
          itemBuilder: (context, index) {
            final event = value[index];
            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: ListTile(
                title: Text(event.title),
                subtitle: Text(
                  '${DateFormat.Hm().format(event.startDate)} - ${DateFormat.Hm().format(event.endDate)}\n${event.location ?? ''}',
                ),
                leading: CircleAvatar(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: Text(
                    DateFormat.d().format(event.startDate),
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                onTap: () => _showEventDetails(event),
              ),
            );
          },
        );
      },
    );
  }

  void _showEventDetails(Event event) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(event.title, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text(
                '${DateFormat.yMMMd('fr_FR').format(event.startDate)} de ${DateFormat.Hm().format(event.startDate)} à ${DateFormat.Hm().format(event.endDate)}',
              ),
              const SizedBox(height: 8),
              if (event.location != null && event.location!.isNotEmpty)
                Text('Lieu: ${event.location}'),
              const SizedBox(height: 16),
              Text(event.description),
            ],
          ),
        );
      },
    );
  }
} 