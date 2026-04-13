import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

export function NavigationSection() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            Breadcrumbs
          </CardTitle>
          <CardDescription>Navegação hierárquica para mostrar localização do usuário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Breadcrumb */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Breadcrumb Básico</h4>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Documentos</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Configurações</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Breadcrumb with Icons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Ícones</h4>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="flex items-center gap-1">
                    <Folder className="h-4 w-4" />
                    Projetos
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Relatórios
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1">
                    <File className="h-4 w-4" />
                    Documento.pdf
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Long Breadcrumb */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Breadcrumb Longo</h4>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Categoria</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Subcategoria</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Produto</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Detalhe</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Breadcrumb"
              code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Categoria</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Página Atual</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

{/* Com ícones */}
<BreadcrumbLink href="#" className="flex items-center gap-1">
  <Home className="h-4 w-4" />
  Home
</BreadcrumbLink>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Variants */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Tabs
          </CardTitle>
          <CardDescription>Navegação por abas para organização de conteúdo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Tabs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs Padrão</h4>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList>
                <TabsTrigger value="tab1">Conta</TabsTrigger>
                <TabsTrigger value="tab2">Senha</TabsTrigger>
                <TabsTrigger value="tab3">Notificações</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Conteúdo da aba Conta</p>
              </TabsContent>
              <TabsContent value="tab2" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Conteúdo da aba Senha</p>
              </TabsContent>
              <TabsContent value="tab3" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Conteúdo da aba Notificações</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Tabs with Icons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs com Ícones</h4>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Análises
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Visão geral do dashboard</p>
              </TabsContent>
              <TabsContent value="analytics" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Dados analíticos</p>
              </TabsContent>
              <TabsContent value="settings" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Configurações do sistema</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Gradient Tabs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs com Gradiente</h4>
            <Tabs defaultValue="home" className="w-full">
              <TabsList className="flex flex-wrap gap-2 h-auto p-1">
                <TabsTrigger value="home" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Home
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Pedidos
                </TabsTrigger>
                <TabsTrigger value="customers" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Clientes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="home" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Página inicial</p>
              </TabsContent>
              <TabsContent value="products" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Lista de produtos</p>
              </TabsContent>
              <TabsContent value="orders" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Histórico de pedidos</p>
              </TabsContent>
              <TabsContent value="customers" className="p-4 border rounded-lg mt-2">
                <p className="text-sm text-muted-foreground">Lista de clientes</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Tabs"
              code={`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
    <TabsTrigger value="tab3">Aba 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Conteúdo da aba 1
  </TabsContent>
  <TabsContent value="tab2">
    Conteúdo da aba 2
  </TabsContent>
</Tabs>

{/* Com ícones */}
<TabsTrigger value="settings" className="flex items-center gap-2">
  <Settings className="h-4 w-4" />
  Configurações
</TabsTrigger>

{/* Com gradiente ativo */}
<TabsTrigger 
  value="home" 
  className="data-[state=active]:gradient-primary data-[state=active]:text-white"
>
  Home
</TabsTrigger>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5 text-primary" />
            Navigation Menu
          </CardTitle>
          <CardDescription>Menu de navegação com dropdowns e submenus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Navigation Menu */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Menu Básico</h4>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="#"
                          >
                            <Package className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Catálogo
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Explore nosso catálogo completo de produtos.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none">Novidades</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Últimos lançamentos da coleção.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none">Promoções</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Ofertas especiais e descontos.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none">Mais Vendidos</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Os favoritos dos clientes.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Documentação
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Guias e tutoriais completos.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <Code className="h-4 w-4" />
                              API Reference
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Referência completa da API.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <HelpCircle className="h-4 w-4" />
                              Suporte
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Central de ajuda e FAQ.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground" href="#">
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Comunidade
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Fórum e discussões.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    Preços
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    Contato
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Simple Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Links Simples</h4>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    <Users className="h-4 w-4 mr-2" />
                    Equipe
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Navigation Menu"
              code={`<NavigationMenu>
  <NavigationMenuList>
    {/* Link simples */}
    <NavigationMenuItem>
      <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
        Home
      </NavigationMenuLink>
    </NavigationMenuItem>

    {/* Com dropdown */}
    <NavigationMenuItem>
      <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-4 w-[400px] md:grid-cols-2">
          <li>
            <NavigationMenuLink asChild>
              <a href="#" className="block p-3 rounded-md hover:bg-accent">
                <div className="text-sm font-medium">Título</div>
                <p className="text-sm text-muted-foreground">Descrição</p>
              </a>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="card-interactive border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Guia de Uso
          </CardTitle>
          <CardDescription>Quando usar cada componente de navegação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                Breadcrumb
              </h4>
              <p className="text-xs text-muted-foreground">
                Use para mostrar a hierarquia de navegação e permitir retorno fácil a páginas anteriores. Ideal para sites com estrutura profunda.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" />
                Tabs
              </h4>
              <p className="text-xs text-muted-foreground">
                Use para organizar conteúdo relacionado em uma mesma página, alternando entre diferentes visualizações sem navegar para outra rota.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Menu className="h-4 w-4 text-primary" />
                Navigation Menu
              </h4>
              <p className="text-xs text-muted-foreground">
                Use para navegação principal do site com submenus ricos em conteúdo. Ideal para headers e barras de navegação globais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
