<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ImageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'images' => 'required|images|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

    }
}
