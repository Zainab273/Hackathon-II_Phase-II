"""
Chat API endpoint for natural language task management
@see specs/005-backend-mcp-server/spec.md
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

from ..db.session import get_db
from ..models.task import Task
from ..models.user import User

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    timestamp: str
    userId: Optional[str] = None


class ResponseMetadata(BaseModel):
    operation: Optional[str] = None
    taskId: Optional[str] = None
    taskName: Optional[str] = None
    taskStatus: Optional[str] = None
    taskCount: Optional[int] = None
    tasks: Optional[list] = None


class ChatResponse(BaseModel):
    response: str
    timestamp: str
    metadata: Optional[ResponseMetadata] = None


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Process natural language chat messages and execute task operations
    
    User Story 1: Receive Chat Message and Process Task Command
    """
    try:
        message = request.message.lower().strip()
        
        # Simple NLP routing (will be enhanced by 006-agent-nlp-logic)
        if "add" in message or "create" in message:
            return await handle_add_task(user_id, message, db)
        elif "list" in message or "show" in message or "all" in message:
            return await handle_list_tasks(user_id, message, db)
        elif "complete" in message or "done" in message or "finish" in message:
            return await handle_complete_task(user_id, message, db)
        elif "update" in message or "change" in message or "modify" in message:
            return await handle_update_task(user_id, message, db)
        elif "delete" in message or "remove" in message:
            return await handle_delete_task(user_id, message, db)
        else:
            return ChatResponse(
                response="I can help you manage tasks. Try: 'Add task to buy groceries', 'List all tasks', 'Complete task 1', etc.",
                timestamp=datetime.utcnow().isoformat()
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def handle_add_task(user_id: str, message: str, db: Session) -> ChatResponse:
    """User Story 2: Add New Tasks via MCP Tool"""
    # Extract task name from message
    task_name = extract_task_name(message)
    
    if not task_name:
        return ChatResponse(
            response="I couldn't understand the task name. Please try: 'Add task to [task description]'",
            timestamp=datetime.utcnow().isoformat()
        )
    
    # Create task
    task = Task(
        title=task_name,
        user_id=int(user_id) if user_id.isdigit() else 1,
        completed=False
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return ChatResponse(
        response=f"Got it! I've added '{task_name}' to your tasks.",
        timestamp=datetime.utcnow().isoformat(),
        metadata=ResponseMetadata(
            operation="add",
            taskId=str(task.id),
            taskName=task.title,
            taskStatus="active"
        )
    )


async def handle_list_tasks(user_id: str, message: str, db: Session) -> ChatResponse:
    """User Story 3: List All Tasks via MCP Tool"""
    # Get all tasks for user
    tasks = db.query(Task).filter(Task.user_id == int(user_id) if user_id.isdigit() else 1).all()
    
    if not tasks:
        return ChatResponse(
            response="You don't have any tasks yet. Would you like to create one?",
            timestamp=datetime.utcnow().isoformat(),
            metadata=ResponseMetadata(
                operation="list",
                taskCount=0,
                tasks=[]
            )
        )
    
    task_list = [
        {
            "id": str(task.id),
            "name": task.title,
            "status": "completed" if task.completed else "active",
            "dueDate": task.due_date.isoformat() if hasattr(task, 'due_date') and task.due_date else None
        }
        for task in tasks
    ]
    
    return ChatResponse(
        response="Here are your current tasks:",
        timestamp=datetime.utcnow().isoformat(),
        metadata=ResponseMetadata(
            operation="list",
            taskCount=len(tasks),
            tasks=task_list
        )
    )


async def handle_complete_task(user_id: str, message: str, db: Session) -> ChatResponse:
    """User Story 4: Mark Tasks Complete via MCP Tool"""
    task_id = extract_task_id(message)
    
    if not task_id:
        return ChatResponse(
            response="Please specify which task to complete. Try: 'Complete task 1'",
            timestamp=datetime.utcnow().isoformat()
        )
    
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == int(user_id) if user_id.isdigit() else 1
    ).first()
    
    if not task:
        return ChatResponse(
            response=f"I couldn't find task {task_id}. Would you like to see your task list?",
            timestamp=datetime.utcnow().isoformat()
        )
    
    if task.completed:
        return ChatResponse(
            response=f"Task '{task.title}' is already marked as complete.",
            timestamp=datetime.utcnow().isoformat(),
            metadata=ResponseMetadata(
                operation="complete",
                taskId=str(task.id),
                taskName=task.title,
                taskStatus="completed"
            )
        )
    
    task.completed = True
    db.commit()
    
    return ChatResponse(
        response=f"Great! I've marked '{task.title}' as complete.",
        timestamp=datetime.utcnow().isoformat(),
        metadata=ResponseMetadata(
            operation="complete",
            taskId=str(task.id),
            taskName=task.title,
            taskStatus="completed"
        )
    )


async def handle_update_task(user_id: str, message: str, db: Session) -> ChatResponse:
    """User Story 5: Update Task Details via MCP Tool"""
    task_id = extract_task_id(message)
    
    if not task_id:
        return ChatResponse(
            response="Please specify which task to update. Try: 'Update task 1 to [new name]'",
            timestamp=datetime.utcnow().isoformat()
        )
    
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == int(user_id) if user_id.isdigit() else 1
    ).first()
    
    if not task:
        return ChatResponse(
            response=f"I couldn't find task {task_id}.",
            timestamp=datetime.utcnow().isoformat()
        )
    
    # Extract new task name
    new_name = extract_task_name(message)
    if new_name:
        task.title = new_name
        db.commit()
    
    return ChatResponse(
        response=f"I've updated task {task_id}.",
        timestamp=datetime.utcnow().isoformat(),
        metadata=ResponseMetadata(
            operation="update",
            taskId=str(task.id),
            taskName=task.title,
            taskStatus="active" if not task.completed else "completed"
        )
    )


async def handle_delete_task(user_id: str, message: str, db: Session) -> ChatResponse:
    """User Story 6: Delete Tasks via MCP Tool"""
    task_id = extract_task_id(message)
    
    if not task_id:
        return ChatResponse(
            response="Please specify which task to delete. Try: 'Delete task 1'",
            timestamp=datetime.utcnow().isoformat()
        )
    
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == int(user_id) if user_id.isdigit() else 1
    ).first()
    
    if not task:
        return ChatResponse(
            response=f"I couldn't find task {task_id}.",
            timestamp=datetime.utcnow().isoformat()
        )
    
    task_name = task.title
    db.delete(task)
    db.commit()
    
    return ChatResponse(
        response=f"I've deleted '{task_name}'.",
        timestamp=datetime.utcnow().isoformat(),
        metadata=ResponseMetadata(
            operation="delete",
            taskId=str(task_id),
            taskName=task_name
        )
    )


def extract_task_name(message: str) -> Optional[str]:
    """Extract task name from natural language message"""
    # Simple extraction - will be enhanced by 006-agent-nlp-logic
    keywords = ["add", "create", "task", "to", "update", "change", "modify"]
    words = message.split()
    
    # Find where task description starts
    start_idx = 0
    for i, word in enumerate(words):
        if word in keywords:
            start_idx = i + 1
    
    if start_idx < len(words):
        return " ".join(words[start_idx:]).strip()
    
    return None


def extract_task_id(message: str) -> Optional[int]:
    """Extract task ID from natural language message"""
    import re
    # Look for numbers in the message
    numbers = re.findall(r'\d+', message)
    if numbers:
        return int(numbers[0])
    return None
