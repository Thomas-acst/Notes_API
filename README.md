# API NOTES

Este é um projeto de estudo de API's com o objetivo de principal de criar uma API
com funções genéricas de um app de notas. 

- Na parte de notas o usuário terá as opções de criação, visualização, remoção e 
atualização das suas próprias notas, isso tudo juntamente com a função de cadastro e
login de usuário.

- O sistema também contará com uma parte administrativa para um usuário admin no qual 
poderá excluir, criar, modificar e visualizar todas as notas de todos os outros usuários.
Para o acesso destes admins terá uma campo no banco de dados chamado role, onde irá armazenar
no JWT token essa informação junto ao id do usuário, e quando for acessar alguma área 
administrativa ele irá conferir esses dados.  

- Para segurança irei utilizar o JWT token e seu armazenamento será cookies com flags
secure, httponly e samesite. Para banco de dados irei utilizar o MongoDB.

Considerações:
Na hora de verificar a veracidade do JWT não precisamos olhar no header com o título
Authorization igual fiz no projeto anterior, já que neste caso, quem armazena o JWT
é o cookie.



## Endpoints:

### Users:
- POST - user/register - FEITO
- POST - user/login - FEITO
- DELETE - user/del - FEITO
- DELETE - user/logout - FEITO
- DELETE - user/update - FEITO



### Admin:
- POST - admin/login - FEITO
- GET - admin/users - FEITO
- DELETE - admin/users/del - FEITO
- POST - admin/users/add - FEITO
- POST - admin/users/update - FEITO

- GET - admin/notes - FEITO
- DELETE - admin/notes/del/id - FEITO
- POST - admin/notes/add - FEITO

- DELETE - admin/logout - FEITO



### Notes: 
- POST - notes/add - FEITO
- DELETE - notes/del/id - FEITO
- GET - notes/show - FEITO
- POST - notes/update/id - FEITO


**OBS**: Não fiz nenhuma middleware de verificação de usuário ou credenciais pois queria escrever mais vezes o código para fixá-lo.
