# might-pipe
executing terminal commands right in a file

## commands:
###
Each command writes the output and the executed command itself to the output tab with format
<br/>
`$`executed command`\n`
<br/>
output of executed command`\n\n`
#

* **Execute command**:
    ###
    Executes each selection as shell command and pastes output instad of this command
    #
    
* **Run command**:
    ###
    Like **_Execute command_** but without modifying document
    #
* **Pipe**:
    ###
    Redirects each selection to chosen command and pastes output instad of this command
    #
* **Run pipe**:
    ###
    Like **_Pipe_** but without modifying document
    #

## Quik install
```sh 
wget -O might-pipe.vsix "https://github.com/AnatolyRybchych/might-pipe/blob/main/bin/might-pipe-0.0.1.vsix?raw=true" && code --install-extension ./might-pipe.vsix
```

