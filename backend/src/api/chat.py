"""
Chat API endpoint for natural language task management
@see specs/005-backend-mcp-server/spec.md
@see specs/006-agent-nlp-logic/spec.md
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

from ..db.session import get_db
from ..models.task import Task
from ..models.user import User
from ..services.nlp_router import nlp_router

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
    
    User Story 1 (005): Receive Chat Message and Process Task Command
    User Story 1 (006): Interpret Natural Language and Route to Correct Tool
    """
    try:
        message = request.message.strip()
        
        # Use NLP router for intent detection (006-agent-nlp-logic)
        intent = nlp_router.detect_intent(message)
        
        # Route to appropriate handler
        if intent == 'add':
            return await handle_add_task(user_id, message, db)
        elif intent == 'list':
            return await handle_list_tasks(user_id, message, db)
        elif intent == 'complete':
            return await handle_complete_task(user_id, message, db)
        elif intent == 'update':
            return await handle_update_task(user_id, message, db)
        elif intent == 'delete':
            return await handle_delete_task(user_id, message, db)
        else:
            return ChatResponse(
                response="I can help you manage tasks. Try: 'Add task to buy groceries', 'List all tasks', 'Complete task 1', etc.",
                timestamp=datetime.utcnow().isoformat()
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def handle_add_task(user_id: str, message: str, db: Session) -> ChatResponse:
    """
    User Story 2 (005): Add New Tasks via MCP Tool
    User Story 2 (006): Create Tasks from Natural Language Descriptions
    """
    # Extract task name using NLP router
    task_name = nlp_router.extract_task_name(message, 'add')
    
    if not task_name:
        response_text = nlp_router.generate_response('add', False, {
            'error_type': 'missing_task_name'
        })
        return ChatResponse(
            response=response_text,
            timestamp=datetime.utcnow().isoformat()
        )
    
    # Extract due date if mentioned
    due_date_str = nlp_router.extract_due_date(message)
    
    # Create task
    task = Task(
        title=task_name,
        user_id=int(user_id) if user_id.isdigit() else 1,
        completed=False
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    response_text = nlp_router.generate_response('add', True, {
        'task_name': task.title
    })
    
    return ChatResponse(
        response=response_text,
        timestamp=datetime.utcnow().isoformat(),
        metadata=ResponseMetadata(
            operation="add",
            taskId=str(task.id),
            taskName=task.title,
            taskStatus="active"
        )
    )


async def handle_list_tasks(user_id: str, message: str, db: Session) -> ChatResponse:
    """
    User Story 3 (005): List All Tasks via MCP Tool
    User Story 3 (006): List Tasks with Natural Language Filters
    """
    # Extract status filter if mentioned
    status_filter = nlp_router.extract_status_filter(message)
    
    # Get tasks for user
    query = db.query(Task).filter(Task.user_id == int(user_id) if user_id.isdigit() else 1)
    
    if status_filter == 'completed':
        query = query.filter(Task.completed == True)
    elif status_filter == 'active':
        query = query.filter(Task.completed == False)
    
    tasks = query.all()
    
    response_text = nlp_router.generate_response('list', True, {
        'count': len(tasks)
    })
    
    if not tasks:
        return ChatResponse(
            response=response_text,
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
        response=response_text,
        timestamp=datetime.utcnow().isoformat(),
        metadata=ResponseMetadata(
            operation="list",
            taskCount=len(tasks),
            tasks=task_list
        )
    )


async def handle_complete_task(user_id: str, message: str, db: Session) -> ChatResponse:
    """
    User Story 4 (005): Mark Tasks Complete via MCP Tool
    User Story 4 (006): Mark Tasks Complete from Various Phrasings
    """
    # Extract task ID using NLP router
    task_id = nlp_router.extract_task_id(message)
    
    if not task_id:
        response_text = nlp_router.generate_response('complete', False, {
            'error_type': 'missing_task_id'
        })
        return ChatResponse(
            response=response_text,
            timestamp=datetime.utcnow().isoformat()
        )
    
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == int(user_id) if user_id.isdigit() else 1
    ).first()
    
    if not task:
        response_text = nlp_router.generate_response('complete', False, {
            'error_type': 'not_found',
            'task_id': task_id
        })
        return ChatResponse(
            response=response_text,
            timestamp=datetime.utcnow().isoformat()
        )
    
    if task.completed:
        response_text = nlp_router.generate_response('complete', False, {
            'error_type': 'already_complete',
            'task_name': task.title
        })
        return ChatResponse(
            response=response_text,
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
    
    response_text = nlp_router.generate_response('complete', True, {
        'task_name': task.title
    })
    
    return ChatResponse(
        response=response_text,
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

