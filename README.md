# Prompts

A convenient replacement for standard built-in browser prompts like alert, confirm, etc.
Methods return promises that resolve when the user completes the action defined by the particular prompt.
All styling and functionality is built-in, so Prompts.js is all you need.

## Methods

`Prompts.alert(string message)` - replacement for browser 'alert' method.

`Prompts.confirm(string message)` - replacement for browser 'confirm' method.

`Prompts.prompt(string message, string defaultvalue, string placeholder)` - similar to browser 'prompt' method.

`Prompts.waiting(string message)` - opens a window with moving dots, and displays the message until called again with an empty message.

`Prompts.timed(string message, int milliSeconds)` - opens a window with the desired message, and closes it again after the defined number of milliseconds have passed.


`Prompts.isOpen()` - returns true if a prompt window is already open with some other information.

`Prompts.close()` - forces an already open window to close - calls the promise reject function if defined.

`Prompts.setAutoClose(bool enabled)` - when 'auto close' is enabled, the library will automatically close a window if a new one is requested. When 'auto close' is false, an exception will be thrown instead.
