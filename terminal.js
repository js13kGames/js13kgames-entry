function print_message(text) {
    var old_text = terminal.value;
    if (old_text.length) {
        terminal.value = old_text + "\n>> " + text;
    } else {
        terminal.value = ">> " + text;
    }
    terminal.scrollTop = terminal.scrollHeight;
}