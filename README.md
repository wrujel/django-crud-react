<div align='center'>

  [![demo][demo]][demo-link]
  [![status][status]][status-link]
  [![test][tests]][tests-link]

</div>

<div align='center'>
  <a href='/'>
    <img
      src='/images/screenshot.png'
      alt='Screenshot of the app'
      width='100%'
    />
  </a>
</div>

<div align='center'>
  <h1>Task App with Django and React</h1>
</div>

<div align='center'>

  [![Django][django]][django-link]
  [![Django REST Framework][django-rest-framework]][django-rest-framework-link]
  [![Python][python]][python-link]
  [![React][react]][react-link]
  [![Vite][vite]][vite-link]
  [![Tailwind CSS][tailwindcss]][tailwindcss-link]
  [![Axios][axios]][axios-link]
  [![React Hook Form][react-hook-form]][react-hook-form-link]
  [![React Hot Toast][react-hot-toast]][react-hot-toast-link]

</div>

<div align='center'>
  Full-stack CRUD application for managing tasks, built with Django REST Framework on the backend and React with Vite on the frontend. Features a clean UI styled with Tailwind CSS and toast notifications.

  [Demo]({{DEMO_URL}}) · [Report issue](/issues) · [Suggest something](/issues)
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running locally](#running-locally)
  - [Build](#build)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Demo](#demo)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Features

- [x] Full CRUD operations for tasks (Create, Read, Update, Delete)
- [x] RESTful API built with Django REST Framework
- [x] React frontend powered by Vite for fast development
- [x] Responsive design with Tailwind CSS
- [x] Form validation with React Hook Form
- [x] Toast notifications with React Hot Toast
- [x] Client-side routing with React Router
- [x] Auto-generated API documentation with CoreAPI
- [x] CORS support for cross-origin requests
- [x] Static files served with WhiteNoise
- [x] Database flexibility via dj-database-url (SQLite or PostgreSQL)
- [x] Production-ready with Gunicorn and Railway deployment

## Tech Stack

- [Python](https://www.python.org/)
- [Django 4.2](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React 18](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [React Hook Form](https://react-hook-form.com/)
- [React Hot Toast](https://react-hot-toast.com/)
- [React Router](https://reactrouter.com/)
- [CoreAPI](https://www.coreapi.org/)
- [WhiteNoise](https://whitenoise.readthedocs.io/)
- [Gunicorn](https://gunicorn.org/)

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- pip

### Installation

```bash
git clone https://github.com/wrujel/django-crud-react.git
cd django-crud-react
pip install -r requirements.txt
cd client
npm install
cd ..
```

### Running locally

Start the backend server:

```bash
python manage.py migrate
python manage.py runserver
```

In a separate terminal, start the frontend dev server:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the React app. The Django API runs at [http://localhost:8000](http://localhost:8000).

### Build

Build the frontend for production:

```bash
cd client
npm run build
```

## Environment Variables

To run this project, you may need to configure the following environment variables:

| Variable           | Description                                             | Required |
| :----------------- | :------------------------------------------------------ | :------: |
| `DATABASE_URL`     | Database connection URL (defaults to SQLite if not set) |    No    |
| `VITE_BACKEND_URL` | Backend API URL used by the React app in production     |    No    |

## Project Structure

```
/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/             # API client (Axios)
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── django_crud_api/         # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── tasks/                   # Django tasks app
│   ├── models.py
│   ├── serializer.py
│   ├── urls.py
│   └── views.py
├── images/
│   └── screenshot.png
├── manage.py
├── requirements.txt
├── Procfile
└── nixpacks.toml
```

## Demo

You can check out the demo:

[![Demo][demo]][demo-link]

## API Reference

| Method   | Endpoint                   | Description       | Auth Required |
| :------- | :------------------------- | :---------------- | :-----------: |
| `GET`    | `/tasks/api/v1/tasks/`     | List all tasks    |      No       |
| `POST`   | `/tasks/api/v1/tasks/`     | Create a new task |      No       |
| `GET`    | `/tasks/api/v1/tasks/:id/` | Get task by ID    |      No       |
| `PUT`    | `/tasks/api/v1/tasks/:id/` | Update a task     |      No       |
| `DELETE` | `/tasks/api/v1/tasks/:id/` | Delete a task     |      No       |

API documentation is also available at `/tasks/docs/` powered by CoreAPI.

## Contributing

Contributions are welcome! If you have suggestions or find bugs, please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

---

<!-- Badges -->
[django]: https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green
[django-rest-framework]: https://img.shields.io/badge/django%20rest-092E20?style=for-the-badge&logo=django&logoColor=green
[python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[react]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[tailwindcss]: https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[axios]: https://img.shields.io/badge/Axios-671ddf?style=for-the-badge&logo=axios&logoColor=white
[react-hook-form]: https://img.shields.io/badge/React%20Hook%20Form-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-hot-toast]: https://img.shields.io/badge/React--Hot--Toast-2A2A2A?style=for-the-badge&logo=npm&logoColor=white

<!-- Badge links -->
[django-link]: https://www.djangoproject.com/
[django-rest-framework-link]: https://www.django-rest-framework.org/
[python-link]: https://www.python.org/
[react-link]: https://react.dev/
[vite-link]: https://vite.dev/
[tailwindcss-link]: https://tailwindcss.com/
[axios-link]: https://axios-http.com/
[react-hook-form-link]: https://react-hook-form.com/
[react-hot-toast-link]: https://react-hot-toast.com/

<!-- Status/Demo badges -->
[demo]: https://img.shields.io/badge/🚀%20Live%20Demo-000000?style=for-the-badge&&logoColor=white&color=0a6bdb
[status-link]: https://github.com/wrujel/monitor-repos
[tests-link]: https://github.com/wrujel/monitor-tests

[demo-link]: https://django-crud-react.onrender.com/
[status]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-repos%2Fmain%2Fdata%2Fdjango-crud-react.json
[tests]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-tests%2Fmain%2Fdata%2Fdjango-crud-react.json
