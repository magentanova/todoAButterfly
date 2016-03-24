# Normal Mode

Design a model-view pattern (required view: React; suggested model/collection: Backbone) for a todo list. The user should be able to do the following: 

  - Add a new task and see it appear in a list of tasks
  - Click a remove button and see the task disappear
  - Add details like the task's description, or its due date.


# Hard Mode

Instead of simply removing tasks, users have the ability to toggle the done/undone status of tasks. Your app should thus have three routes, manipulated via the three "tabs" in the gif below: `all`, `done`, and `undone`. Clicking on done should cause only the finished tasks to appear, clicking on undone should ... you get the idea. 

Basically, replicate the behavior you see in this gif. Note that there are checkboxes that should appear when a box is clicked -- they're just not showing up in the darn gif. 

![](./todo.gif)