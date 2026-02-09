"""
NLP Router for intent detection and parameter extraction
@see specs/006-agent-nlp-logic/spec.md
"""

import re
from typing import Dict, Optional, List, Tuple
from datetime import datetime, timedelta


class NLPRouter:
    """
    Natural Language Processing router for task management commands
    
    User Stories 1-6: Intent detection and parameter extraction
    """
    
    def __init__(self):
        self.intent_patterns = {
            'add': [
                r'add\s+(?:a\s+)?task',
                r'create\s+(?:a\s+)?task',
                r'new\s+task',
                r'remind\s+me\s+to',
            ],
            'list': [
                r'list\s+(?:all\s+)?tasks?',
                r'show\s+(?:me\s+)?(?:all\s+)?(?:my\s+)?tasks?',
                r'what\s+tasks?',
                r'view\s+tasks?',
            ],
            'complete': [
                r'complete\s+task',
                r'mark\s+.*\s+(?:as\s+)?(?:done|complete)',
                r'finish\s+task',
                r'check\s+off',
                r'i\s+finished',
            ],
            'update': [
                r'update\s+task',
                r'change\s+task',
                r'modify\s+task',
                r'rename',
                r'edit\s+task',
            ],
            'delete': [
                r'delete\s+task',
                r'remove\s+task',
                r'cancel\s+task',
            ],
        }
    
    def detect_intent(self, message: str) -> str:
        """
        Detect user intent from natural language message
        
        User Story 1: Interpret Natural Language and Route to Correct Tool
        """
        message_lower = message.lower().strip()
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    return intent
        
        return 'unknown'
    
    def extract_task_name(self, message: str, intent: str) -> Optional[str]:
        """
        Extract task name from natural language message
        
        User Story 2: Create Tasks from Natural Language Descriptions
        """
        message_lower = message.lower().strip()
        
        # Patterns for task name extraction
        patterns = [
            r'(?:add|create)\s+(?:a\s+)?task\s+(?:to\s+)?(.+)',
            r'remind\s+me\s+to\s+(.+)',
            r'(?:update|change|rename)\s+.*\s+to\s+(.+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message_lower)
            if match:
                task_name = match.group(1).strip()
                # Remove trailing "by [date]" if present
                task_name = re.sub(r'\s+by\s+\w+.*$', '', task_name)
                return task_name
        
        # Fallback: remove common keywords
        keywords = ['add', 'create', 'task', 'to', 'a', 'the']
        words = message_lower.split()
        filtered = [w for w in words if w not in keywords]
        
        if filtered:
            return ' '.join(filtered).strip()
        
        return None
    
    def extract_task_id(self, message: str) -> Optional[int]:
        """
        Extract task ID from natural language message
        
        User Story 4: Mark Tasks Complete from Various Phrasings
        """
        # Look for "task N" or just "N"
        patterns = [
            r'task\s+(\d+)',
            r'#(\d+)',
            r'\b(\d+)\b',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message.lower())
            if match:
                return int(match.group(1))
        
        return None
    
    def extract_due_date(self, message: str) -> Optional[str]:
        """
        Extract due date from natural language message
        
        User Story 2: Create Tasks from Natural Language Descriptions
        """
        message_lower = message.lower()
        today = datetime.now()
        
        # Relative dates
        if 'today' in message_lower:
            return today.isoformat()
        elif 'tomorrow' in message_lower:
            return (today + timedelta(days=1)).isoformat()
        elif 'next week' in message_lower:
            return (today + timedelta(days=7)).isoformat()
        
        # Day of week
        days = {
            'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
            'friday': 4, 'saturday': 5, 'sunday': 6
        }
        
        for day_name, day_num in days.items():
            if day_name in message_lower:
                current_day = today.weekday()
                days_ahead = (day_num - current_day) % 7
                if days_ahead == 0:
                    days_ahead = 7  # Next week if same day
                target_date = today + timedelta(days=days_ahead)
                return target_date.isoformat()
        
        return None
    
    def extract_status_filter(self, message: str) -> Optional[str]:
        """
        Extract status filter from natural language message
        
        User Story 3: List Tasks with Natural Language Filters
        """
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['completed', 'done', 'finished']):
            return 'completed'
        elif any(word in message_lower for word in ['active', 'pending', 'incomplete', 'todo']):
            return 'active'
        
        return None
    
    def generate_response(self, intent: str, success: bool, details: Dict) -> str:
        """
        Generate natural language response based on operation result
        
        User Stories 2-6: Friendly confirmations for all operations
        """
        if not success:
            return self._generate_error_response(intent, details)
        
        if intent == 'add':
            task_name = details.get('task_name', 'task')
            return f"Got it! I've added '{task_name}' to your tasks."
        
        elif intent == 'list':
            count = details.get('count', 0)
            if count == 0:
                return "You don't have any tasks yet. Would you like to create one?"
            return f"Here are your current tasks:"
        
        elif intent == 'complete':
            task_name = details.get('task_name', 'task')
            return f"Great! I've marked '{task_name}' as complete."
        
        elif intent == 'update':
            task_name = details.get('task_name', 'task')
            return f"I've updated '{task_name}'."
        
        elif intent == 'delete':
            task_name = details.get('task_name', 'task')
            return f"I've deleted '{task_name}'."
        
        return "Done!"
    
    def _generate_error_response(self, intent: str, details: Dict) -> str:
        """Generate user-friendly error messages"""
        error_type = details.get('error_type', 'unknown')
        
        if error_type == 'not_found':
            task_id = details.get('task_id')
            return f"I couldn't find task {task_id}. Would you like to see your task list?"
        
        elif error_type == 'already_complete':
            task_name = details.get('task_name', 'task')
            return f"Task '{task_name}' is already marked as complete."
        
        elif error_type == 'missing_task_name':
            return "I couldn't understand the task name. Please try: 'Add task to [task description]'"
        
        elif error_type == 'missing_task_id':
            return f"Please specify which task to {intent}. Try: '{intent.capitalize()} task 1'"
        
        return "I couldn't complete that operation. Please try again."


# Global instance
nlp_router = NLPRouter()
