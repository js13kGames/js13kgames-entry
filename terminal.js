function print_message(text) {
    var old_text = terminal_window.value;
    if (old_text.length) {
        terminal_window.value = old_text + "\n>> " + text;
    } else {
        terminal_window.value = ">> " + text;
    }
    terminal_window.scrollTop = terminal_window.scrollHeight;
}