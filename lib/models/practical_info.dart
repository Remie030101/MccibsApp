class PracticalInfo {
  final String id;
  final String title;
  final String description;
  final String type; // 'pdf' or 'text'
  final String? content; // for text type
  final String? filePath; // for pdf type
  final String? fileName; // for pdf type
  final String category;
  final bool isActive;
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  PracticalInfo({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    this.content,
    this.filePath,
    this.fileName,
    required this.category,
    required this.isActive,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PracticalInfo.fromJson(Map<String, dynamic> json) {
    return PracticalInfo(
      id: json['_id'],
      title: json['title'],
      description: json['description'],
      type: json['type'],
      content: json['content'],
      filePath: json['filePath'],
      fileName: json['fileName'],
      category: json['category'],
      isActive: json['isActive'],
      createdBy: json['createdBy'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'description': description,
      'type': type,
      'content': content,
      'filePath': filePath,
      'fileName': fileName,
      'category': category,
      'isActive': isActive,
      'createdBy': createdBy,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get categoryDisplayName {
    switch (category) {
      case 'academic':
        return 'Académique';
      case 'administrative':
        return 'Administratif';
      case 'student_life':
        return 'Vie étudiante';
      case 'other':
        return 'Autre';
      default:
        return 'Autre';
    }
  }

  String get typeDisplayName {
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'text':
        return 'Texte';
      default:
        return 'Inconnu';
    }
  }
} 