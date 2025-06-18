from enum import Enum

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    TRANSCRIBING = "transcribing"
    GENERATING_NOTES = "generating_notes"
    COMPLETED = "completed"
    FAILED = "failed"

class SubjectCategory(str, Enum):
    MATHEMATICS = "MATHEMATICS"
    COMPUTER_SCIENCE = "COMPUTER_SCIENCE"
    SCIENCES = "SCIENCES"
    HUMANITIES = "HUMANITIES"
    SOCIAL_SCIENCES = "SOCIAL_SCIENCES"
    BUSINESS = "BUSINESS"
    HEALTH_SCIENCES = "HEALTH_SCIENCES" 