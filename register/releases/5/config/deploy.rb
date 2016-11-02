require 'mina/bundler'
require 'mina/rails'
require 'mina/git'
require 'mina/rbenv'

# Basic settings:
#   domain       - The hostname to SSH to.
#   deploy_to    - Path to deploy into.
#   repository   - Git repo to clone from. (needed by mina/git)
#   branch       - Branch name to deploy. (needed by mina/git)

set :domain, '95.85.53.19'
set :deploy_to, '/var/www/register.nebulis.io'
set :repository, 'https://gitlab.com/optimista/register.nebulis.io.git'
set :branch, 'master'

# For system-wide RVM install.
#   set :rvm_path, '/usr/local/rvm/bin/rvm'

# Manually create these paths in shared/ (eg: shared/config/database.yml) in your server.
# They will be linked in the 'deploy:link_shared_paths' step.
set :shared_paths, ['config/database.yml', 'config/secrets.yml', 'log']

# Optional settings:
set :user, 'deployer'    # Username in the server to SSH to.
#   set :port, '30000'     # SSH port number.
#   set :forward_agent, true     # SSH forward_agent.
set :term_mode, nil

# This task is the environment that is loaded for most commands, such as
# `mina deploy` or `mina rake`.
task :environment do
  # If you're using rbenv, use this to load the rbenv environment.
  # Be sure to commit your .ruby-version or .rbenv-version to your repository.
  invoke :'rbenv:load'

  # For those using RVM, use this to load an RVM version@gemset.
  # invoke :'rvm:use[ruby-1.9.3-p125@default]'
end

# Put any custom mkdir's in here for when `mina setup` is ran.
# For Rails apps, we'll make some of the shared paths that are shared between
# all releases.
task :setup => :environment do
  queue! %[mkdir -p "#{deploy_to}/#{shared_path}/log"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/#{shared_path}/log"]

  queue! %[mkdir -p "#{deploy_to}/#{shared_path}/config"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/#{shared_path}/config"]

  queue! %[mkdir -p "#{deploy_to}/#{shared_path}/sockets"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/#{shared_path}/sockets"]

  queue! %[mkdir -p "#{deploy_to}/#{shared_path}/pids"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/#{shared_path}/pids"]

  queue! %[touch "#{deploy_to}/#{shared_path}/config/database.yml"]
  queue! %[touch "#{deploy_to}/#{shared_path}/config/secrets.yml"]
  queue  %[echo "-----> Be sure to edit '#{deploy_to}/#{shared_path}/config/database.yml' and 'secrets.yml'."]  

  if repository
    repo_host = repository.split(%r{@|://}).last.split(%r{:|\/}).first
    repo_port = /:([0-9]+)/.match(repository) && /:([0-9]+)/.match(repository)[1] || '22'

    queue %[
      if ! ssh-keygen -H  -F #{repo_host} &>/dev/null; then
        ssh-keyscan -t rsa -p #{repo_port} -H #{repo_host} >> ~/.ssh/known_hosts
      fi
    ]
  end
end

desc "Deploys the current version to the server."
task :deploy => :environment do
  to :before_hook do
    # Put things to run locally before ssh
  end
  deploy do
    # Put things that will set up an empty directory into a fully set-up
    # instance of your project.
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'bundle:install'
    invoke :'rails:db_migrate'
    invoke :'rails:assets_precompile'
    invoke :'deploy:cleanup'

    to :launch do
      queue "mkdir -p #{deploy_to}/#{current_path}/tmp/"
      queue "touch #{deploy_to}/#{current_path}/tmp/restart.txt"
      invoke :'puma:stop'
      invoke :'puma:start'
    end
  end
end

namespace :puma do
  desc "Start the application"
  task :start => :environment do
    queue! 'echo "-----> Start Puma"'
    queue! 'source ~/.bashrc'    
    queue! "cd #{deploy_to}/#{current_path} && bundle exec puma -e production -p 3000 -d -b unix://#{deploy_to}/#{shared_path}/sockets/register.nebulis.sock --pidfile #{deploy_to}/#{shared_path}/pids/puma.pid 1>> log/console.log 2>> log/console_err.log"
  end

  desc "Stop the application"
  task :stop do
    queue! 'echo "-----> Stop Puma"'    
    queue! "kill `cat #{deploy_to}/#{shared_path}/pids/puma.pid`"
  end

  desc "Restart the application"
  task :restart do
    queue! 'echo "-----> Restart Puma"'
    queue! 'source ~/.bashrc'
    queue! "kill -s SIGUSR2 `cat #{deploy_to}/#{shared_path}/pids/puma.pid`"
  end
end