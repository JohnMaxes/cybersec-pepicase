document.addEventListener('DOMContentLoaded', function() {
    // Xử lý sự kiện nhấn vào các ô màu để chọn/bỏ chọn
    document.querySelectorAll('.color-row div[id]').forEach(function(colorDiv) {
        colorDiv.addEventListener('click', function() {
            colorDiv.classList.toggle('selected'); // Toggle class 'selected'
        });
    });

    document.querySelector('.apply-filters').addEventListener('click', function() {
        let selectedCollections = [];
        document.querySelectorAll('.collection-checkbox:checked').forEach(function(checkbox) {
            selectedCollections.push(checkbox.id); // Lấy id của checkbox
        });

        let selectedColors = [];
        document.querySelectorAll('.color-row div[id].selected').forEach(function(colorDiv) {
            selectedColors.push(colorDiv.id); // Lấy id của div màu
        });

        let filters = {
            collections: selectedCollections,
            colors: selectedColors
        };

        fetch('http://localhost/pepicase/public/get_filtered_products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(filters)
        })
        .then(response => response.json())
        .then(data => {
            let productContainer = document.querySelector('.product-list');
            productContainer.innerHTML = '';
            data.products.forEach(product => {
                let productHTML = `
                <article class="product-container">
                    <figure class="image-wrapper">
                        <a href="http://localhost/pepicase/public/product/${product.ID}">
                            <img loading="lazy" src="${product.Image}" class="product-image" alt="${product.Name}" />
                        </a>
                    </figure>
                    <h2 class="product-name">
                        <a href="http://localhost/pepicase/public/product/${product.ID}">${product.Name}</a>
                    </h2>
                    <p class="product-price">
                        <a href="http://localhost/pepicase/public/product/${product.ID}">$${product.Price} USD</a>
                    </p>
                </article>`;

                productContainer.innerHTML += productHTML;
            });
        })
        .catch(error => console.error('Error:', error));
    });

    // Clear filters functionality
    document.getElementById('clear-filters').addEventListener('click', function() {
        // Uncheck all checkboxes
        document.querySelectorAll('.collection-checkbox').forEach(function(checkbox) {
            checkbox.checked = false;
        });

        // Remove 'selected' class from all color divs
        document.querySelectorAll('.color-row div[id]').forEach(function(colorDiv) {
            colorDiv.classList.remove('selected');
        });

        // Fetch and display the original product list (first 6 products)
        fetch('http://localhost/pepicase/public/get_all_products', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            let productContainer = document.querySelector('.product-list');
            productContainer.innerHTML = '';
            data.products.forEach(product => {
                let productHTML = `
                <article class="product-container">
                    <figure class="image-wrapper">
                        <a href="http://localhost/pepicase/public/product/${product.ID}">
                            <img loading="lazy" src="${product.Image}" class="product-image" alt="${product.Name}" />
                        </a>
                    </figure>
                    <h2 class="product-name">
                        <a href="http://localhost/pepicase/public/product/${product.ID}">${product.Name}</a>
                    </h2>
                    <p class="product-price">
                        <a href="http://localhost/pepicase/public/product/${product.ID}">$${product.Price} USD</a>
                    </p>
                </article>`;
                productContainer.innerHTML += productHTML;
            });
        })
        .catch(error => console.error('Error:', error));
    });

    let currentPage = 1; // Biến để theo dõi trang hiện tại
    const limit = 6; // Số sản phẩm cần tải mỗi lần

    // Hàm xử lý khi nhấn nút "Load more"
    document.getElementById('load-more').addEventListener('click', function() {
        currentPage++; // Tăng số trang hiện tại lên 1
        fetch('http://localhost/pepicase/public/get_more_products?page=' + currentPage, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            let productContainer = document.querySelector('.product-list');
            data.products.forEach(product => {
                let productHTML = `
                <article class="product-container">
                    <figure class="image-wrapper">
                        <a href="http://localhost/pepicase/public/product/${product.ID}">
                            <img loading="lazy" src="${product.Image}" class="product-image" alt="${product.Name}" />
                        </a>
                    </figure>
                    <h2 class="product-name">
                        <a href="http://localhost/pepicase/public/product/${product.ID}">${product.Name}</a>
                    </h2>
                    <p class="product-price">
                        <a href="http://localhost/pepicase/public/product/${product.ID}">$${product.Price} USD</a>
                    </p>
                </article>`;
                productContainer.innerHTML += productHTML;
            });
            // Ẩn nút "Load more" nếu số sản phẩm trả về ít hơn số sản phẩm cần tải
            if (data.products.length < limit) {
                document.getElementById('load-more').style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
    });

});
