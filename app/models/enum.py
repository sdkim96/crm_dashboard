import enum

class UType(enum.Enum):
    STAFF = 'staff'
    MANAGER = 'manager'
    DIRECTOR = 'director'
    ADMIN = 'admin'

class ProjectCategory(enum.Enum):
    SHORT_TERM = 'short_term'
    MID_TERM = 'mid_term'
    LONG_TERM = 'long_term'
    FOREVER = 'forever'

class ProjectPriority(enum.Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'

class ProjectCategoryDTO(enum.Enum):
    SHORT_TERM = 'short_term'
    MID_TERM = 'mid_term'
    LONG_TERM = 'long_term'
    FOREVER = 'forever'
    ALL = 'all'

class ProjectPriorityDTO(enum.Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    CRITICAL = 'critical'
    ALL = 'all'

class ProjectDateFilter(enum.Enum):
    ALL= 'all'
    WEEK = 'week'
    MONTH = 'month'

class CreateProjectOptions(enum.Enum):
    LLM = 'llm'
    HUMAN = 'human'

class Role(enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"