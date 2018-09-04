order = ["util.js", "messages.js", "terminal.js", "entities.js", "BSP.js",
         "items.js", "dungeon.js", "scenes.js", "main.js"]

compiled = ""

for f_name in order:
    with open(f_name, "r") as f:
        compiled += f.read() + "\n"
        f.close()

with open("game.js", "w+") as f:
    f.write(compiled)
    f.close()