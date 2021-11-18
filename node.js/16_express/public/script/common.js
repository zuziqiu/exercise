axios.post('/api/list')
  .then(function (response) {
    console.log(response);
    let render = template.compile('<%=data%>')
    let html = render({data: 100});
    document.querySelector('#list').innerHTML = html
  })
  .catch(function (error) {
    console.log(error);
  });