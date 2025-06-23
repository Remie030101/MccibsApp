class Event {
  final String id;
  final String title;
  final String description;
  final DateTime startDate;
  final DateTime endDate;
  final String? location;
  final String category;

  Event({
    required this.id,
    required this.title,
    required this.description,
    required this.startDate,
    required this.endDate,
    this.location,
    required this.category,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['_id'],
      title: json['title'],
      description: json['description'],
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      location: json['location'],
      category: json['category'],
    );
  }

  String get categoryDisplayName {
    switch (category) {
      case 'academic':
        return 'Académique';
      case 'social':
        return 'Social';
      case 'sports':
        return 'Sportif';
      case 'workshop':
        return 'Atelier';
      default:
        return 'Autre';
    }
  }
} 