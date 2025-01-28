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

class ProjectDateFilter(enum.Enum):
    ALL= 'all'
    WEEK = 'week'
    MONTH = 'month'

class ProgramStatus(enum.Enum):
    INTEREST = "interest"          # 관심 단계
    REQUESTED = "requested"        # 교육 요청 단계
    NEGOTIATION = "negotiation"    # 세부사항 협의
    SITE_VISIT = "site_visit"      # 현장 방문
    PREPARATION = "preparation"    # 자료 준비
    EXECUTION = "execution"        # 교육 실시
    COMPLETED = "completed"        # 완료

class CreateProjectOptions(enum.Enum):
    LLM = 'llm'
    HUMAN = 'human'

class Role(enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"

class OrderBy(enum.Enum):
    CREATED = "created_at"
    UPDATED = "updated_at"