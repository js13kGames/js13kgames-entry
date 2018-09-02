/*
Command             | Description

Global commands
help                -   Prints out a help message.
ls [dir]            -   Prints out the contents of [dir].
help [program]      -   Prints the description of the [program] and its market value.
help [script]       -   Prints the description of the [script] and its market value.

Mission Selection commands
install [program]   -   Equips the [program] to be used inside the dungeons.
uninstall [program] -   Unequips the [program] to allowing other programs to be installed.
sell [program]      -   Permanently removes the [program], exchanging it for an amount of money.
sell [script]       -   Permanently removes the [script], exchanging it for an amount of money.

Dungeon commands
[script]            -   Executes the [script].
drop [script/item]  -   Places the [script/item] on the floor.

Sometimes, the terminal will ask the user to choose between one or more choices, for example:
While walking over a pile of items, the player will be asked how many items to get:
> Choose an item to grab:
> 1 : [script/item], 2 : [script/item], 3 : [script/item]
*/


var commandlist = {
    "help": "\
help             |   Prints out a help message.\n\
ls [dir]         |   Prints out the contents of [dir].\n\
help [program]   |   Prints the description of the [program] and its market value.\n\
help [script]    |   Prints the description of the [script] and its market value.",
    "ls": "programs/  scripts/  installed/"
}