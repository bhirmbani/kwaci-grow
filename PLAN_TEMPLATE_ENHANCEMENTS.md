# Plan Template Enhancements

## Overview
Enhanced the plan creation workflow in the `/plan` route to automatically populate goals and tasks from planning templates with proper dependency mapping, branch requirements, and user experience improvements.

## Key Enhancements Made

### 1. Enhanced PlanTemplateService.createPlanFromTemplate()

**File:** `src/lib/services/planTemplateService.ts`

**Improvements:**
- **Branch Validation**: Added validation to require branch selection when templates contain goals
- **Two-Pass Task Creation**: Implemented proper task dependency mapping from template IDs to actual task IDs
- **Goal-Task Linking**: Automatically links goals to tasks based on category matching
- **Proper Field Mapping**: All template fields are correctly mapped to actual records

**Key Features:**
- Creates tasks first and builds ID mapping for dependency resolution
- Updates task dependencies with actual task IDs instead of template IDs
- Sets `branchId` for all goals using the plan's branch
- Links goals to tasks of the same category via `linkedTaskIds`
- Maintains referential integrity throughout the process

### 2. Enhanced Plan Creation Form

**File:** `src/components/plan/CreatePlanForm.tsx`

**Improvements:**
- **Dynamic Validation**: Schema validation that adapts based on template requirements
- **Branch Requirement UI**: Visual indicators when branch selection is required
- **Template Preview**: Enhanced preview showing goals, tasks, and metrics count
- **Real-time Feedback**: Immediate validation and error messages

**Key Features:**
- Dynamic schema factory that requires branch when template has goals
- Template details loading to show what will be created
- Enhanced branch selection UI with conditional requirements
- Visual warnings when branch is required for goals

### 3. User Experience Enhancements

**Visual Improvements:**
- Template preview shows count of goals, tasks, and metrics that will be created
- Branch selection field shows required (*) indicator when needed
- Warning message when branch is required for templates with goals
- Enhanced error messages and validation feedback

**Validation Improvements:**
- Prevents plan creation without branch when template has goals
- Clear error messages explaining requirements
- Real-time validation as user selects templates

### 4. Testing Infrastructure

**File:** `src/routes/test-database.tsx`

**Added comprehensive test for:**
- Template creation with goals and tasks
- Plan creation from template with branch requirement
- Verification of proper goal and task creation
- Validation of dependency mapping
- Confirmation of goal-task linking

## Technical Implementation Details

### Task Dependency Mapping Algorithm
```typescript
// 1. Create tasks first and collect ID mapping
const templateToActualTaskIdMap = new Map<string, string>()
for (const taskTemplate of taskTemplates) {
  const actualTaskId = uuidv4()
  templateToActualTaskIdMap.set(taskTemplate.id, actualTaskId)
  // Create task with empty dependencies initially
}

// 2. Update dependencies with actual task IDs
for (const { task, templateDependencies } of createdTasks) {
  const actualDependencies = templateDependencies
    .map(templateId => templateToActualTaskIdMap.get(templateId))
    .filter(Boolean) // Remove undefined values
  
  await db.planTasks.update(task.id, { dependencies: actualDependencies })
}
```

### Goal-Task Linking Strategy
- Links goals to tasks based on category matching
- Production goals → Production tasks
- Sales goals → Sales tasks
- etc.

### Branch Requirement Logic
- Templates with goals require branch selection
- UI adapts to show requirement indicators
- Validation prevents submission without branch
- Clear error messages guide user

## Benefits

1. **Complete Template Integration**: Templates now provide fully functional plans with goals and tasks
2. **Proper Relationships**: Task dependencies and goal-task links are correctly established
3. **Data Integrity**: Branch requirements ensure proper goal tracking
4. **Better UX**: Users understand requirements and see what will be created
5. **Maintainable Code**: Clean separation of concerns and proper error handling

## Usage

1. **Create Template**: Use existing template creation with goals and tasks
2. **Select Template**: Choose template in plan creation form
3. **Branch Selection**: Required when template has goals (UI will indicate)
4. **Preview**: See what goals, tasks, and metrics will be created
5. **Create Plan**: All relationships and dependencies are automatically established

## Future Enhancements

1. **Custom Goal-Task Linking**: Allow templates to specify custom goal-task relationships
2. **Conditional Dependencies**: Support for conditional task dependencies
3. **Template Validation**: Pre-validate templates for consistency
4. **Bulk Operations**: Support for creating multiple plans from templates
5. **Template Versioning**: Version control for template changes
