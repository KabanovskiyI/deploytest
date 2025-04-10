document.querySelectorAll('.tasks input[type="checkbox"]').forEach((checkbox, index) => {
    checkbox.addEventListener('change', () => {
      const task = checkbox.closest('.task');
      const output = document.getElementById('task-output');
      const path = document.getElementById('task-path');
      // Добавляем/удаляем классы
      if (checkbox.checked) {
        task.classList.remove('hidden');
        task.classList.add('opened');
      } else {
        task.classList.remove('opened');
        task.classList.add('hidden');
      }
  
      // Определяем текст для каждой задачи
      const messages = [
        'Ви піднялись на другий поверх!',
        'Ви потрапили до правого крила коледжу!',
        'Вітаємо в аудиторії 221!'
      ];
      const paths = [
        'Перейдіть до правого крила за напрямком SW',
        'Тепер знайдіть аудиторію 221 нарямком S',
      ];
  
      // Показываем сообщение
      output.textContent = messages[index];
      path.textContent = paths[index];
    });
  });