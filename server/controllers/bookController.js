import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { db } from "../database/db.js";
import cloudinary from "cloudinary";

// 1. Create a New Book (Admin Only)
export const createBook = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Book image is required.", 400));
    }

    const { image } = req.files;
    const { title, genre, author, edition } = req.body;

    if (!title || !genre || !author || !edition) {
        return next(new ErrorHandler("Please provide title, genre, author, and edition.", 400));
    }

    const cloudinaryResponse = await cloudinary.v2.uploader.upload(image.tempFilePath, {
        folder: "Library_Books",
    });

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(new ErrorHandler("Failed to upload book image.", 500));
    }

    const newBook = {
        title,
        genre,
        author,
        edition,
        status: "Available", 
        image: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
        addedBy: req.user.id, 
        createdAt: new Date(),
    };

    const docRef = await db.collection("books").add(newBook);

    res.status(201).json({
        success: true,
        message: "Book added successfully.",
        bookId: docRef.id,
    });
});

// 2. Update a Book (Admin Only)
export const updateBook = catchAsyncErrors(async (req, res, next) => {
    const bookId = req.params.id;
    const { title, genre, author, edition } = req.body;

    const bookRef = db.collection("books").doc(bookId);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    let bookData = bookDoc.data();
    
    let updateData = {
        title: title || bookData.title,
        genre: genre || bookData.genre,
        author: author || bookData.author,
        edition: edition || bookData.edition,
        updatedAt: new Date(),
    };

    if (req.files && req.files.image) {
        const { image } = req.files;
        
        if (bookData.image && bookData.image.public_id) {
            await cloudinary.v2.uploader.destroy(bookData.image.public_id);
        }

        const cloudinaryResponse = await cloudinary.v2.uploader.upload(image.tempFilePath, {
            folder: "Library_Books",
        });

        if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(new ErrorHandler("Failed to upload new book image.", 500));
        }

        updateData.image = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        };
    }

    await bookRef.update(updateData);

    res.status(200).json({
        success: true,
        message: "Book updated successfully.",
    });
});

// 3. Delete a Book (Admin Only)
export const deleteBook = catchAsyncErrors(async (req, res, next) => {
    const bookId = req.params.id;

    const bookRef = db.collection("books").doc(bookId);
    const bookDoc = await bookRef.get();

    if (!bookDoc.exists) {
        return next(new ErrorHandler("Book not found.", 404));
    }

    const bookData = bookDoc.data();

    if (bookData.image && bookData.image.public_id) {
        await cloudinary.v2.uploader.destroy(bookData.image.public_id);
    }

    await bookRef.delete();

    res.status(200).json({
        success: true,
        message: "Book and its image deleted successfully.",
    });

});
